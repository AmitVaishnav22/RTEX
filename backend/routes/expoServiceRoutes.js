import express from "express";
import authServiceKey from "../middleware/expoService.middleware.js";
import { getPublicLinks } from "../controllers/expoController.js";

const router = express.Router();

router.get("/getlinks", authServiceKey, getPublicLinks);

export default router;