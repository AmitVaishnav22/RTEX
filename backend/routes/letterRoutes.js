import express from "express";
import verifyFirebaseToken from "../middleware/auth.middleware.js";
import { getLetters, saveLetter, updateLetter, deleteLetter, uploadToDrive ,getLetterByPublicId,publishLetter, toggleVisibility, onSetPasscode} from "../controllers/letterController.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getLetters);
router.post("/save", verifyFirebaseToken, saveLetter);
router.put("/update/:id", verifyFirebaseToken, updateLetter);
router.delete("/delete/:id", verifyFirebaseToken, deleteLetter);
router.post("/upload", verifyFirebaseToken, uploadToDrive);
router.get("/public/:publicId",getLetterByPublicId);
router.post("/publish/:letterId", verifyFirebaseToken, publishLetter);
router.put("/toggle-visibility/:id", verifyFirebaseToken, toggleVisibility);
router.put("/set-passcode/:id", verifyFirebaseToken, onSetPasscode);
export default router;