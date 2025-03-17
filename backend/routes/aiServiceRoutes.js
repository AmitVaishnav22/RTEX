import express from "express";
import { aiContent } from "../controllers/aiServiceController.js"
import verifyFirebaseToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", aiContent);

export default router;