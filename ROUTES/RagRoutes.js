import express from "express";
import { generateAnswer } from "../controllers/ragController.js";

const router = express.Router();

router.post("/ask", generateAnswer);

export default router;
