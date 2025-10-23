import Voyage from "voyageai";
import OpenAI from "openai";
import { Document } from "../models/Document.js";

const voyage = new Voyage({ apiKey: process.env.VOYAGE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAnswer = async (req, res) => {
  try {
    const { question } = req.body;

    // Step 1: Create embedding for user query
    const queryEmbedding = await voyage.embeddings.create({
      model: "voyage-2",
      input: question,
    });

    const queryVector = queryEmbedding.data[0].embedding;

    // Step 2: Find similar docs in MongoDB (vector search)
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          queryVector,
          path: "embedding",
          numCandidates: 10,
          limit: 3,
          index: "vector_index", // name of your vector index
        },
      },
    ]);

    const context = results.map((doc) => doc.content).join("\n");

    // Step 3: Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers based on provided context.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
      contextUsed: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
