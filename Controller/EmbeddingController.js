import Document from "../model/Document.js";
import { VoyageAIClient } from "voyageai";

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

// Add document + embedding
export const addDocument = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const embRes = await voyage.embed({
      input: [text],
      model: "voyage-large-2",
    });
    const embedding = embRes.data[0].embedding;

    const doc = await Document.create({ text, embedding });
    res.json({ message: "Document stored", doc });
  } catch (err) {
    console.error("Error in addDocument:", err);
    let errorMessage = "Failed to store document";
    if (err.name === "MongoServerError" && err.code === 121) {
      errorMessage = "Schema validation failed. Check if the data format matches the Mongoose schema.";
    } else if (err.message.includes("vector search")) {
        errorMessage = "Vector search index might be missing or misconfigured in MongoDB Atlas.";
    } else if (err.message.includes("API key")) {
        errorMessage = "Voyage AI API key is invalid or missing.";
    }
    res.status(500).json({ error: errorMessage, details: err.message });
  }
};

// Query using MongoDB Atlas Vector Search
export const queryDocument = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const embRes = await voyage.embed({
      input: [query],
      model: "voyage-large-2",
    });
    const queryEmbedding = embRes.data[0].embedding;

    // Vector search using $vectorSearch in MongoDB Atlas
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: "embedding",
          numCandidates: 100,
          limit: 3,
          index: "vector_indexx", 
        },
      },
      { $project: { text: 1, _id: 0, score: { $meta: "vectorSearchScore" } } },
    ]);

    res.json({
      query,
      topMatch: results[0],
      allResults: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
};
