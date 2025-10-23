import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import embeddingRoutes from "./ROUTES/embeddingRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ✅ Test route
app.get("/test", async (req, res) => {
  try {
    const Test = mongoose.model("Test", new mongoose.Schema({ name: String }));
    await Test.create({ name: "Hello from rag_db!" });
    res.send("✅ Document inserted into rag_db!");
  } catch (err) {
    res.status(500).send("❌ Error: " + err.message);
  }
});

// ✅ Embedding routes
app.use("/api/embedding", embeddingRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
