import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  preferences: {
    newExports: { type: String, enum: ["daily", "weekly", "realtime", null], default: null },
    weeklyTop: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});


const SubscriptionSchema = mongoose.model("SubscriptionSchema", subscriptionSchema);
export default SubscriptionSchema;