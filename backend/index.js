import connectDB from "./db/db.js";
import dotenv from "dotenv"
import {app} from "./app.js"

dotenv.config({
  path:'./.env'
})

connectDB().then(()=>{
  app.listen(process.env.PORT|| 8000,()=>{
      console.log(`Server running at port : ${process.env.PORT}`)
  })
}).catch((error)=>{
  console.log("MONGO DB CONNECTION ERROR",error)
})



// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import admin from "firebase-admin";
// import fs from "fs";
// import { google } from "googleapis";
// import Letter from "./models/letters.model.js";
// import connectDB from "./db/db.js";
// import cookieParser from "cookie-parser"


// const app = express();
// const PORT = process.env.PORT || 5000;

// dotenv.config(
//   {
//     path: './.env'
//   }
// );
// app.use(cors(
//   {
//     origin: process.env.CLIENT_URL,
//     credentials: true
//   }
// ))

// app.use(express.json({limit:'16kb'}))
// app.use(express.urlencoded({extended:true,limit:'16kb'}))
// app.use(express.static("public"))
// app.use(cookieParser())   

// connectDB().then(()=>{
//   app.listen(process.env.PORT|| 8000,()=>{
//       console.log(`Server running at port : ${process.env.PORT}`)
//   })
// }).catch((error)=>{
//   console.log("MONGO DB CONNECTION ERROR",error)
// })



// // Initialize Firebase Admin SDK
// // const serviceAccount = JSON.parse(fs.readFileSync("./firebaseServiceAccount.json", "utf8"));

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });

// const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     "http://localhost:8000/auth/google/callback"
//   );

//   const verifyFirebaseToken = async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });
  
//     try {
//       const decodedToken = await admin.auth().verifyIdToken(token);
//       req.user = decodedToken;
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Invalid token", error });
//     }
//   };
  

// app.get("/auth/google", (req, res) => {
//     const url = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://www.googleapis.com/auth/drive.file"],
// });
//     res.redirect(url);
// });

// // app.get("/auth/google/callback", async (req, res) => {
// //     const { code } = req.query;
// //     const { tokens } = await oauth2Client.getToken(code);
// //     oauth2Client.setCredentials(tokens);
// //     res.json({ message: "Google Drive Auth Successful", tokens });
// //   });

// app.post("/auth/google/callback", verifyFirebaseToken, async (req, res) => {
//   try {
//     const { googleAccessToken } = req.body;
//     if (!googleAccessToken) {
//       return res.status(400).json({ error: "Missing Google access token" });
//     }

//     const userId = req.user.uid; 

//     await admin.auth().setCustomUserClaims(userId, { googleOAuthToken: googleAccessToken });

//     res.json({ message: "Google Drive Auth Successful" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to authenticate", details: error.message });
//   }
// });




//   app.post("/upload",verifyFirebaseToken, async (req, res) => {
//     try {
//       const { title, content } = req.body;
//       const userId = req.user.uid;
  
//       // ✅ Retrieve Google OAuth token from Firebase
//       const userRecord = await admin.auth().getUser(userId);
//       const oauthToken = userRecord.customClaims?.googleOAuthToken;
  
//       if (!oauthToken) {
//         return res.status(403).json({ error: "Google Drive authentication required." });
//       }
  
//       // ✅ Use the stored token to authenticate Google Drive
//       const oauth2Client = new google.auth.OAuth2();
//       oauth2Client.setCredentials({ access_token: oauthToken });
  
//       const drive = google.drive({ version: "v3", auth: oauth2Client });
  
//       const fileMetadata = {
//         name: `${title}.docx`,
//         mimeType: "application/vnd.google-apps.document",
//       };
  
//       const media = {
//         mimeType: "text/html",
//         body: content,
//       };
  
//       const file = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: "id",
//       });
  
//       res.json({ message: "File uploaded successfully", fileId: file.data.id });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to upload file", details: error.message });
//     }
//   });
  

// app.get("/letters", verifyFirebaseToken,async (req, res) => {
//     const userId = req.user.uid;
//     const letters = await Letter.find({ userId });
//     res.json(letters);
//   });

//   app.post("/saveletter", verifyFirebaseToken,async (req, res) => {
//     const { title, content } = req.body;
//     const userId = req.user.uid;
//     console.log(userId);
//     await Letter.create({ userId, title, content });
//     res.json({ message: "Letter saved!" });
//   });

//   app.put("/updateletter/:id", verifyFirebaseToken, async (req, res) => {
//     try {
//       const { title, content } = req.body;
//       const letterId = req.params.id;
  
//       const updatedLetter = await Letter.findByIdAndUpdate(letterId, { title, content }, { new: true });
  
//       if (!updatedLetter) {
//         return res.status(404).json({ error: "Letter not found" });
//       }
  
//       res.json({ message: "Letter updated successfully", updatedLetter });
//     } catch (error) {
//       console.error("❌ Error updating letter:", error);
//       res.status(500).json({ error: "Failed to update letter." });
//     }
//   });
  
//   app.delete("/deleteletter/:id", verifyFirebaseToken, async (req, res) => {
//     try {
//       const letterId = req.params.id;
//       await Letter.findByIdAndDelete(letterId);
  
//       res.json({ message: "Letter deleted successfully" });
//     } catch (error) {
//       console.error("❌ Error deleting letter:", error);
//       res.status(500).json({ error: "Failed to delete letter." });
//     }
//   });
  
