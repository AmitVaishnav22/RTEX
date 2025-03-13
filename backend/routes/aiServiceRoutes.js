import express from "express";
import { generateAIResponse } from "../controllers/aiServiceController.js"
import verifyFirebaseToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", verifyFirebaseToken, generateAIResponse);

export default router;