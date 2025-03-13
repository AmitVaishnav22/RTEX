import Letter from "../models/letters.model.js";
import admin from "../db/firebase.js";
import { google } from "googleapis";

const getLetters = async (req, res) => {
  const letters = await Letter.find({ userId: req.user.uid });
  //console.log(letters)
  res.json(letters);
};

const saveLetter = async (req, res) => {
  const { title, content } = req.body;
  await Letter.create({ userId: req.user.uid, title, content });
  res.json({ message: "Letter saved!" });
};

const updateLetter = async (req, res) => {
  try {
      const { title, content } = req.body;
      const letterId = req.params.id;
      const updatedLetter = await Letter.findByIdAndUpdate(letterId, { title, content }, { new: true });
      if (!updatedLetter) {
            return res.status(404).json({ error: "Letter not found" });
        }
        res.json({ message: "Letter updated successfully", updatedLetter });
      } catch (error) {
        console.error("Error updating letter:", error);
        res.status(500).json({ error: "Failed to update letter." });
    }
};

const deleteLetter = async (req, res) => {
  try {
    await Letter.findByIdAndDelete(req.params.id);
    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete letter" });
  }
};

const uploadToDrive = async (req, res) => {
  try {
      const { title, content } = req.body;
      const userId = req.user.uid;
      //Retrieve Google OAuth token from Firebase
      const userRecord = await admin.auth().getUser(userId);
      const oauthToken = userRecord.customClaims?.googleOAuthToken;    
      if (!oauthToken) {
        return res.status(403).json({ error: "Google Drive authentication required." });
      }  
      // Use the stored token to authenticate Google Drive
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: oauthToken });
      const drive = google.drive({ version: "v3", auth: oauth2Client });
      const fileMetadata = {
        name: `${title}.docx`,
        mimeType: "application/vnd.google-apps.document",
      };  
      const media = {
        mimeType: "text/html",
        body: content,
      };
      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });
      res.json({ message: "File uploaded successfully", fileId: file.data.id });
      } catch (error) {
        res.status(500).json({ error: "Failed to upload file", details: error.message });
      }
};

export {
    getLetters,
    saveLetter,
    updateLetter,
    deleteLetter,
    uploadToDrive,
}