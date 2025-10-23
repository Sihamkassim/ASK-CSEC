import express from "express";
import { addDocument, queryDocument } from "../Controller/EmbeddingController.js";

const router = express.Router();

router.post("/add", addDocument);
router.post("/query", queryDocument);

export default router;
