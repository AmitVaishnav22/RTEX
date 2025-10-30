import express from "express";
import { subscribeUser , verifyOtp , savePreferences} from "../../controllers/emailServiceController/subscriptionProcess.controller.js"

const router = express.Router();

router.post("/subscribe", subscribeUser);
router.post("/verify", verifyOtp);
router.post("/preferences", savePreferences);

export default router;