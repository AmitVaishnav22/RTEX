import Letter from "../models/letters.model.js";
import admin from "../db/firebase.js";
import { nanoid } from "nanoid";
import { google } from "googleapis";
import { getCache,setCache,delCache } from "../services/redisService.js";

const getLetters = async (req, res) => {
  try {
    const userId = req.user.uid;
    const cacheKey = `letters:${userId}`;

    const cachedLetters = await getCache(cacheKey);
    if (cachedLetters) {
      return res.json(cachedLetters);
    }
    const letters = await Letter.find({ userId });
    await setCache(cacheKey, letters, 3600); 
    res.json(letters);
  } catch (error) {
    console.error("Error fetching letters:", error);
    res.status(500).json({ error: "Failed to fetch letters." });
  }
};

const saveLetter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid;

    await Letter.create({ userId, title, content, publicId: null });

    await delCache(`letters:${userId}`);

    res.json({ message: "Letter saved!" });
  } catch (error) {
    console.error("Error saving letter:", error);
    res.status(500).json({ error: "Failed to save letter." });
  }
};

const updateLetter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const letterId = req.params.id;
    const updatedLetter = await Letter.findByIdAndUpdate(letterId, { title, content }, { new: true });

    if (!updatedLetter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    await delCache(`letters:${req.user.uid}`);

    res.json({ message: "Letter updated successfully", updatedLetter });
  } catch (error) {
    console.error("Error updating letter:", error);
    res.status(500).json({ error: "Failed to update letter." });
  }
};

const deleteLetter = async (req, res) => {
  try {
    await Letter.findByIdAndDelete(req.params.id);
    await delCache(`letters:${req.user.uid}`);
    res.json({ message: "Letter deleted successfully" });
  } catch (error) {
    console.error("Error deleting letter:", error);
    res.status(500).json({ error: "Failed to delete letter." });
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

const publishLetter = async (req, res) => {
  try {
    const letterId = req.params.letterId;
    const userId = req.user.uid;

    const existingLetter = await Letter.findOne({ _id: letterId, userId });
    //console.log("Existing letter:", existingLetter);
    if (!existingLetter) {
      return res.status(404).json({ error: "Letter not found or unauthorized" });
    }
    if (existingLetter.publicId) {
      return res.status(400).json({ error: "Letter is already published" });
    }

    // Pre-fetch all existing publicIds into a Set for O(1) lookup
    const existingIds = await Letter.find({ publicId: { $ne: "" } }).distinct("publicId");
    const idSet = new Set(existingIds);

    let publicId = null;
    const MAX_TRIES = 10;
    
    for (let i = 0; i < MAX_TRIES; i++) {
      const tempId = nanoid(10);
      if (!idSet.has(tempId)) {
        publicId = tempId;
        break;
      }
    }

    if (!publicId) {
      return res.status(500).json({ error: "Failed to generate unique ID. Try again." });
    }

    existingLetter.publicId = publicId;
    await existingLetter.save();

    await delCache(`letters:${req.user.uid}`);
    //console.log(newLetter)
    const publicUrl = `https://rtex.vercel.app/public/${publicId}`;
    res.json({ message: "Letter published", publicUrl });


  } catch (error) {
    console.error("Error publishing letter:", error);
    res.status(500).json({ error: "Failed to publish letter" });
  }
};



const getLetterByPublicId = async (req, res) => {
  try {
    const publicId = req.params.publicId;
    //console.log("Fetching letter by public ID:", publicId);
    const letter = await Letter.findOne({ publicId });
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    //console.log("Letter found by public ID:", letter)
    res.json(letter);
  } catch (error) {
    console.error("Error fetching letter by public ID:", error);
    res.status(500).json({ error: "Failed to fetch letter." });
  }
}

export {
    getLetters,
    saveLetter,
    updateLetter,
    deleteLetter,
    uploadToDrive,
    getLetterByPublicId,
    publishLetter
}