import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8000/auth/google/callback"
);

const googleAuth = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
  res.redirect(url);
};

const googleCallback = async (req, res) => {
    try {
      const { googleAccessToken } = req.body;
      if (!googleAccessToken) return res.status(400).json({ error: "Missing Google access token" });
      await admin.auth().setCustomUserClaims(req.user.uid, { googleOAuthToken: googleAccessToken });
      res.json({ message: "Google Drive Auth Successful" });
    } catch (error) {
      res.status(500).json({ error: "Failed to authenticate", details: error.message });
    }
  };

export {
    googleAuth,
    googleCallback
}