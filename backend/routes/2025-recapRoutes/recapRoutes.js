import express from "express";
import { get2025Recap } from "../../controllers/2025-recap/recapController.js"
import verifyFirebaseToken from "../../middleware/auth.middleware.js";
const router = express.Router();

router.get("/2025-recap", verifyFirebaseToken,get2025Recap);

export default router;