import express from "express";
import { generateSummary } from "../controllers/summary.controller.js";

const router = express.Router();

// Generate conversation summary
router.post("/", generateSummary);

export default router;
