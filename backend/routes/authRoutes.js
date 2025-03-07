import express from "express";
import { googleAuth, googleCallback } from "../controllers/authController.js"
import verifyFirebaseToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/google", googleAuth);
router.post("/google/callback", verifyFirebaseToken, googleCallback);

export default router;