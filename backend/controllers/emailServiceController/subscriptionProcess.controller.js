import SubscriptionSchema from "../../models/subscription.model.js";
import { sendOtpEmail } from "../../services/emailService/sendEmail.js";
import { publishEmailOTP ,publishSubscriptionConfirmed} from "../../services/rabbitmq/producer.js";
import {setCache, getCache, delCache} from "../../services/redisService.js";

const subscribeUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const existingSubscription = await SubscriptionSchema.findOne({ email });
        if (existingSubscription && existingSubscription.verified) {
            return res.status(400).json({ error: "Email already subscribed" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await setCache(`subscription:otp:${email}`, otp, 300); // Cache OTP for 5 minutes
        await publishEmailOTP({ email, otp });
        res.json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
        const storedOtp = await getCache(`subscription:otp:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        await SubscriptionSchema.create({
            email,
            verified: true
        });
        await delCache(`subscription:otp:${email}`);
        await publishSubscriptionConfirmed({email});
        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
}

const savePreferences = async (req, res) => {
    try {
        const { email, preferences } = req.body;
        if (!email || !preferences) return res.status(400).json({ error: "Email and preferences are required" });
        const subscription = await SubscriptionSchema.findOne({ email });
        if (!subscription || !subscription.verified) {
            return res.status(400).json({ error: "Email not verified or subscription not found" });
        }
        subscription.preferences = preferences;
        await subscription.save();
        res.json({ message: "Preferences saved successfully" });
    }catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
}

export { subscribeUser, verifyOtp, savePreferences };