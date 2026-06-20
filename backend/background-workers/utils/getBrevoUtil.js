import { BrevoClient } from "@getbrevo/brevo";

const apiInstance = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

function createEmail({to , subject, html}){
  return {
    sender: {
      name: "RTEX Expo",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
}
export { apiInstance , createEmail};