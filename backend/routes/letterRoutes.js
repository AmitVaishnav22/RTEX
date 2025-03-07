import express from "express";
import verifyFirebaseToken from "../middleware/auth.middleware.js";
import { getLetters, saveLetter, updateLetter, deleteLetter, uploadToDrive } from "../controllers/letterController.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getLetters);
router.post("/save", verifyFirebaseToken, saveLetter);
router.put("/update/:id", verifyFirebaseToken, updateLetter);
router.delete("/delete/:id", verifyFirebaseToken, deleteLetter);
router.post("/upload", verifyFirebaseToken, uploadToDrive);

export default router;