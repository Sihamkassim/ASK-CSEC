import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  content: String,
  embedding: {
    type: [Number],
    index: "vector",
  },
});

export const Document = mongoose.model("Document", documentSchema);
