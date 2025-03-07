import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useSelector } from "react-redux";
import LeftBar from "./LeftBar";

const LetterEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [letterId, setLetterId] = useState(null); // ✅ Track if editing an existing letter
  const user = useSelector((state) => state.auth.user);
  const auth = getAuth();
  const authUser = auth.currentUser;

  console.log("Current User:", user);

  useEffect(() => {
    localStorage.setItem("draftTitle", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem("draftContent", content);
  }, [content]);

  // ✅ Handle selecting a letter for editing
  const handleSelectLetter = (letter) => {
    setTitle(letter.title);
    setContent(letter.content);
    setLetterId(letter._id); // ✅ Store existing letter ID for updating
  };
  const handleCreateNewLetter = () => {
    setTitle("");
    setContent("");
    setLetterId(null); // ✅ Reset letter ID to indicate a new letter
  };

  // ✅ Save or Update Letter in DB
  const handleSaveToDB = async () => {
    try {
      if (!authUser) {
        alert("User not authenticated.");
        return;
      }

      const firebaseToken = await authUser.getIdToken();
      const url = letterId
        ? `http://localhost:8000/letter/update/${letterId}` // ✅ If editing, update the letter
        : "http://localhost:8000/letter/save"; // ✅ If new, create a letter

      const method = letterId ? "PUT" : "POST"; // ✅ Use PUT for updates, POST for new letters

      await axios({
        method,
        url,
        data: { title, content },
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
      });

      alert("Letter saved successfully!");
    } catch (error) {
      console.error("❌ Error saving letter:", error.response?.data || error);
      alert("Failed to save letter.");
    }
  };

  // ✅ Save Letter to Google Drive
  const handleSaveToDrive = async () => {
    try {
      if (!authUser) {
        alert("User not authenticated.");
        return;
      }

      const firebaseToken = await authUser.getIdToken();
      console.log("🔥 Firebase Token Retrieved:", firebaseToken);

      // ✅ Make request to upload file
      await axios.post(
        "http://localhost:8000/upload",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Letter saved successfully to Google Drive!");
    } catch (error) {
      console.error("❌ Error saving letter to Drive:", error.response?.data || error);
      alert("Failed to save letter to Google Drive.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* ✅ Left Sidebar */}
      <LeftBar onSelectLetter={handleSelectLetter} onCreateNewLetter={handleCreateNewLetter}/>

      {/* ✅ Editor Section */}
      <div className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-4">
          {letterId ? "Editing Letter" : "Write a New Letter"}
        </h2>

        {/* ✅ Title Input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          value={content}
          onEditorChange={(newContent) => setContent(newContent)}
          init={{
            height: "80vh",
            width: "100%",
            menubar: true,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
              "emoticons hr directionality pagebreak nonbreaking",
              "image paste",
            ],
            toolbar:
              "undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | " +
              "bullist numlist outdent indent | link image media | forecolor backcolor | " +
              "formatselect fontselect fontsizeselect | cut copy paste | searchreplace | " +
              "blockquote subscript superscript removeformat | charmap emoticons hr pagebreak nonbreaking " +
              "| code fullscreen preview print",
            paste_data_images: true, // Enables Base64 image support
            automatic_uploads: false, // Disables backend uploads
            images_upload_handler: (blobInfo, success) => {
              success("data:image/jpeg;base64," + blobInfo.base64()); // Converts image to Base64
            },
            content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }",
          }}
        />
        {/* ✅ Action Buttons */}
        <div className="flex gap-4 mt-4">
          <button onClick={handleSaveToDB} className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full">
            {letterId ? "Update Letter" : "Save Letter"}
          </button>
          <button onClick={handleSaveToDrive} className="bg-green-600 text-white px-6 py-2 rounded-lg w-full">
            Save to Google Drive
          </button>
        </div>
      </div>
    </div>
  );
};

export default LetterEditor;
