import Letter from "../models/letters.model.js";
import admin from "../db/firebase.js";
import { nanoid } from "nanoid";
import { google } from "googleapis";
import { getCache,setCache,delCache } from "../services/redisService.js";
import { get } from "mongoose";

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
    if (updatedLetter.publicId) {
      await delCache(`publicLetter:${updatedLetter.publicId}`);
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
    await delCache(`letters:${req.user.uid}`);
    await delCache(`publicLetter:${req.params.id}`);
    await delCache(`alias:reverse:${req.params.id}`);
    await delCache(`alias:${req.params.id}`);
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
    let publicId = req.params.publicId;  //may be alias or publicId
    const { passcode } = req.query;
    console.log("Fetching letter by public ID:", publicId);
    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }
    const aliasKey = `alias:${publicId}`;
    const mappedPublicId = await getCache(aliasKey);
     if (mappedPublicId) {
      publicId = mappedPublicId; 
    }

    const cacheKey = passcode
      ? `publicLetter:${publicId}:locked:${passcode}`
      : `publicLetter:${publicId}:unlocked`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      //console.log("Cache hit for:", cacheKey);
      return res.json(JSON.parse(cachedData));
    }

    const letter = await Letter.findOne({ publicId });
    //console.log("Letter found by public ID:", letter);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }
    if (!letter.isPublic) {
      return res.status(403).json({ error: "This letter is not public" });
    }
    if (letter.passcode) {
      if (!passcode) {
        return res.status(401).json({ error: "Passcode required" });
      }
      if (letter.passcode !== passcode) {
        return res.status(405).json({ error: "Incorrect passcode" });
      }
    }
    letter.impressions = (letter.impressions || 0) + 1;
    const now = new Date();
    if (!letter.lastVisited || now - letter.lastVisited > 60 * 60 * 1000) {
      letter.lastVisited = now;
    }
    //console.log("Last visited updated to:", letter.lastVisited); 
    await letter.save();
    await setCache(cacheKey,JSON.stringify(letter),9600);
    await delCache(`letters:${letter.userId}`);
    res.json(letter);
  } catch (error) {
    console.error("Error fetching letter by public ID:", error);
    res.status(500).json({ error: "Failed to fetch letter." });
  }
}

const toggleVisibility = async (req, res) => {
  const id = req.params.id;
  console.log(req.params);
  console.log("Toggling visibility for letter ID:", id);
  try {
    //console.log("Toggling visibility for letter ID:", id);
    const letter = await Letter.findById(id);
    if (!letter || !letter.publicId) {
      return res.status(404).json({ error: "Letter not found" });
    }


    //console.log("Current visibility:", letter);
    //console.log("New visibility:", letter);
    //const a=await getCache(`publicLetter:${letter.publicId}`);
    //console.log("Cache before deletion:", a);
    // const b=await getCache(`publicLetter:${letter.publicId}`);
    // console.log("Cache after deletion:", b);

    letter.isPublic = !letter.isPublic;
    await letter.save();

    await delCache(`letters:${req.user.uid}`);
    
    if (letter.publicId) {
      const lockedKey = `publicLetter:${letter.publicId}:locked:${passcode}`;
      const unlockedKey = `publicLetter:${letter.publicId}:unlocked`;

      await delCache(lockedKey);
      await delCache(unlockedKey);
    }
  
    return res.json({
      success: true,
      message: "Visibility toggled successfully",
      isPublic: letter.isPublic,
      letter
    });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    return res.status(500).json({ error: "Failed to toggle visibility" });
  } 
}
const onSetPasscode = async (req, res) => {
  const letterId = req.params.id;
  const { passcode } = req.body;

  try {
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    letter.passcode = passcode;
    await letter.save();

    await delCache(`letters:${req.user.uid}`);
    if (letter.publicId) {
      // clear both locked + unlocked variants for safety
      const lockedKey = `publicLetter:${letter.publicId}:locked:${passcode}`;
      const unlockedKey = `publicLetter:${letter.publicId}:unlocked`;

      await delCache(lockedKey);
      await delCache(unlockedKey);
    }

    res.json({ message: "Passcode set successfully" });
  } catch (error) {
    console.error("Error setting passcode:", error);
    res.status(500).json({ error: "Failed to set passcode" });
  }
}

const setCustomAlias=async(req,res)=>{
  const letterId  = req.params.id;
  const { alias } = req.body;
  //console.log("Requested alias:", alias);
  const userId = req.user.uid;
  const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (await getCache(`alias:${cleanAlias}`)) {
    return res.status(409).json({ error: "Alias already taken" });
  }
  if (cleanAlias.length < 3 || cleanAlias.length > 50) {
    return res.status(400).json({ error: "Alias must be 3-50 characters long" });
  }
  try {
    const letter = await Letter.findOne({ _id: letterId, userId });
    if (!letter) {
      return res.status(404).json({ error: "Letter not found or unauthorized" });
    }
    //console.log("Letter found:", letter.publicId);
    if (!letter || !letter.publicId || letter.publicId.trim() === "") {
      return res.status(400).json({ error: "Cannot change alias of a unpublished letter" });
    }
    if (await getCache(`alias:reverse:${letter.publicId}`)) {
      return res.status(400).json({ error: "Alias already set for this letter" });
    }
    await setCache(`alias:${cleanAlias}`, letter.publicId, 0);
    await setCache(`alias:reverse:${letter.publicId}`, cleanAlias, 0);
    return res.json({
      message: "Custom alias set successfully",
      publicUrl: `https://rtex.vercel.app/public/${cleanAlias}`,
    });
  } catch (error) {
    console.error("Error setting custom alias:", error);
    res.status(500).json({ error: "Failed to set custom alias" });
  }
}

const getAlias = async (req,res) => {
  const {publicId} = req.params;
  //console.log(publicId)
  try {
    const alias=await getCache(`alias:reverse:${publicId}`)
    //console.log(alias)
    if (!alias) {
      return res.status(404).json({ error: "Alias not found" });
    }
    return res.json({ alias });
  } catch (error) {
    console.error("Error getting alias:", error);
    res.status(500).json({ error: "Failed to get alias" });
  }
}

export {
    getLetters,
    saveLetter,
    updateLetter,
    deleteLetter,
    uploadToDrive,
    getLetterByPublicId,
    publishLetter,
    toggleVisibility,
    onSetPasscode,
    setCustomAlias,
    getAlias
}