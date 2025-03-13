import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useSelector } from "react-redux";
import LeftBar from "./LeftBar";
import CollabModal from "./collabModal";
// import { joinRoom,sendContent,onReceiveContent,onUserJoined } from "./WSService";
const LetterEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [letterId, setLetterId] = useState(null); 
  const [letters, setLetters] = useState([]);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  // const [roomId, setRoomId] = useState(null);
  // const [usersInRoom, setUsersInRoom] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const auth = getAuth();
  const authUser = auth.currentUser;

  console.log("Current User:", user);
  const fetchLetters = async () => {
    try {
      if (!authUser) {
        console.error("No authenticated user found.");
        return;
      }
      const firebaseToken = await authUser.getIdToken();
      const response = await axios.get("http://localhost:7000/letter", {
        headers: { Authorization: `Bearer ${firebaseToken}` },
      });
      setLetters(response.data);
    } catch (error) {
      console.error("Error fetching letters:", error);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  useEffect(() => {
    localStorage.setItem("draftTitle", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem("draftContent", content);
  }, [content]);

  // Handle selecting a letter for editing
  const handleSelectLetter = (letter) => {
    setTitle(letter.title);
    setContent(letter.content);
    setLetterId(letter._id); 
  };
  const handleCreateNewLetter = () => {
    setTitle("");
    setContent("");
    setLetterId(null); 
  };

  // Save or Update Letter in DB
  const handleSaveToDB = async () => {
    try {
      if (!authUser) {
        alert("User not authenticated.");
        return;
      }

      const firebaseToken = await authUser.getIdToken();
      const url = letterId
        ? `http://localhost:7000/letter/update/${letterId}` 
        : "http://localhost:7000/letter/save"; 

      const method = letterId ? "PUT" : "POST"; 

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
      fetchLetters();
    } catch (error) {
      console.error("Error saving letter:", error.response?.data || error);
      alert("Failed to save letter.");
    }
  };

  const handleSaveToDrive = async () => {
    try {
      if (!authUser) {
        alert("User not authenticated.");
        return;
      }

      const firebaseToken = await authUser.getIdToken();
      console.log("Firebase Token Retrieved:", firebaseToken);
      await axios.post(
        "http://localhost:7000/letter/upload",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Letter saved successfully to Google Drive!");
      fetchLetters();
    } catch (error) {
      console.error("Error saving letter to Drive:", error.response?.data || error);
      alert("Failed to save letter to Google Drive.");
    }
  };

  // const handleCreateRoom = () => {
  //   const newRoomId = Math.random().toString(36).substr(2, 6);
  //   setRoomId(newRoomId);
  //   joinRoom(newRoomId, user?.displayName || "Anonymous");
  //   alert(`Room Created: ${newRoomId}`);
  //   setIsCollabOpen(false);
  // };
  // const handleJoinRoom = (roomId) => {
  //   setRoomId(roomId);
  //   joinRoom(roomId, user?.displayName || "Anonymous");
  //   alert(`Joined Room: ${roomId}`);
  //   setIsCollabOpen(false);
  // };

  // onReceiveContent((newContent) => setContent(newContent));

  // onUserJoined((username) => {
  //   alert(`${username} joined the room`);
  //   setUsersInRoom((prevUsers) => [...prevUsers, username]);
  // });


  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <LeftBar onSelectLetter={(letter) => {
          setTitle(letter.title);
          setContent(letter.content);
          setLetterId(letter._id);
        }} onCreateNewLetter={() => {
          setTitle("");
          setContent("");
          setLetterId(null);
        }} fetchLetters={fetchLetters} letters={letters} />
      {/* Editor Section */}
      <div className="flex-grow p-6">
        <h2 className="text-2xl font-bold mb-4">
          {letterId ? "Editing Letter" : "Write a New Letter"}
        </h2>
        <button onClick={() => setIsCollabOpen(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg w-full">
          🤝 Collab
        </button>
        {/* {isCollabOpen && (
        <CollabModal onClose={() => setIsCollabOpen(false)} onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        )}
        <h2 className="text-2xl font-bold mb-4">
          {roomId ? `Collab Room: ${roomId} (${usersInRoom.length} users)` : "Write a New Letter"}
        </h2> */}

        {/* Title Input */}
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
          onEditorChange={(newContent) => {
            setContent(newContent);
            //if (roomId) sendContent(roomId, newContent);
          }}
          init={{
            height: "80vh",
            width: "100%",
            menubar: true,
            plugins: [
              "advlist", "autolink", "lists", "link", "image", "charmap", "print", "preview", "anchor",
              "searchreplace", "visualblocks", "code", "fullscreen",
              "insertdatetime", "media", "table", "paste", "code", "help", "wordcount",
              "emoticons", "hr", "directionality", "pagebreak", "nonbreaking",
              "tiny_draw" 
            ],
            toolbar:
              "undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | " +
              "bullist numlist outdent indent | link image media | forecolor backcolor | " +
              "formatselect fontselect fontsizeselect | cut copy paste | searchreplace | " +
              "blockquote subscript superscript removeformat | charmap emoticons hr pagebreak nonbreaking | " +
              "code fullscreen preview print | draw",
            paste_data_images: true,
            automatic_uploads: false,
            images_upload_handler: (blobInfo, success) => {
              success("data:image/jpeg;base64," + blobInfo.base64());
            },
            content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }",
          }}
        />
        {/* Action Buttons */}
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
