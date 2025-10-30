import SubscriptionSchema from "../../models/subscription.model.js";
import { sendOtpEmail } from "../../services/emailService/sendEmail.js";


const subscribeUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const existingSubscription = await SubscriptionSchema.findOne({ email });
        if (existingSubscription || existingSubscription.verified) {
            return res.status(400).json({ error: "Email already subscribed" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const newSubscription = new SubscriptionSchema({email}) 
        newSubscription.otp = otp;
        newSubscription.otpExpiresAt = otpExpiresAt;
        newSubscription.verified = false;
            
        await newSubscription.save();
        await sendOtpEmail(email, otp);
        res.json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
        const subscription = await SubscriptionSchema.findOne({ email });
        if (!subscription) {
            return res.status(400).json({ error: "No subscription found for this email" });
        }
        if (subscription.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        if (subscription.otpExpiresAt < new Date()) {
            return res.status(400).json({ error: "OTP has expired" });
        }
        subscription.verified = true;
        subscription.otp = null;
        subscription.otpExpiresAt = null;
        await subscription.save();
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