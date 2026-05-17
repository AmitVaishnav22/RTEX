import express from "express";
import {authServiceKey,expoRateLimiter} from "../middleware/expoService.middleware.js";
import { getPublicLinks } from "../controllers/expoController.js";

const router = express.Router();

router.get("/getlinks", authServiceKey, expoRateLimiter, getPublicLinks);

export default router;