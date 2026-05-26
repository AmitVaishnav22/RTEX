// utils/sendOtpEmail.js
import nodemailer from "nodemailer";

export async function sendOtpEmail(email, otp) {
  console.log("Sending OTP to:", email, "OTP:", otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS, 
    },
  });

  const html = `
    <div style="font-family:sans-serif; padding:16px;">
      <h2>Verify your RTEX Expo subscription</h2>
      <p>Your verification code is:</p>
      <h1 style="color:#2563EB; letter-spacing:4px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>— RTEX Expo Team</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"RTEX Expo" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "RTEX Expo Email Verification Code",
    html,
  });

  console.log("Email sent:", info.messageId);
}
