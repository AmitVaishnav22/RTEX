// utils/sendOtpEmail.js
import getTransporter from "../utils/getTansporter.util.js";

async function sendOtpEmail(email, otp) {
  console.log("Sending OTP to:", email, "OTP:", otp);
  const transporter = await getTransporter();

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

async function sendSubscriptionConfirmationEmail(email) {
  const transporter = await getTransporter();
  const html = `
    <div style="font-family:sans-serif; padding:16px;">
      <h2>Subscription Confirmed</h2>
      <p>Thank you for subscribing to RTEX Expo updates! Your email (${email}) has been successfully verified.</p>
      <p>We look forward to keeping you informed about the latest news and updates from RTEX Expo.</p>
      <p>— RTEX Expo Team</p>
    </div>
  `;
  const info = await transporter.sendMail({
    from: `"RTEX Expo" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "RTEX Expo Subscription Confirmed",
    html,
  });
  console.log("Subscription confirmation email sent:", info.messageId);
}

export { sendOtpEmail, sendSubscriptionConfirmationEmail };