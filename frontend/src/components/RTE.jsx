import React, { useState, useEffect,useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useSelector } from "react-redux";
import LeftBar from "./LeftBar";
import CollabButton from "./collabModal";
import { setupWebSocket } from "./WSService.js";
const LetterEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [letterId, setLetterId] = useState(null); 
  const [letters, setLetters] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);


  const user = useSelector((state) => state.auth.user);
  const auth = getAuth();
  const authUser = auth.currentUser;

  const socketRef = useRef(null)
  //const editorRef = useRef(null)
  useEffect(() => {
    if (roomId) {
      socketRef.current = setupWebSocket(roomId, setUsersInRoom, setContent,user?.displayName);
    }
    return () => {
      if (socketRef.current && socketRef.current.disconnect) {
        socketRef.current.disconnect();
        socketRef.current = null;  // Reset after disconnecting
      }
    };
  }, [roomId]);
  

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
  useEffect(() => {
    if(roomId){
      setRoomId(roomId);
    }
  },[roomId])
  // useEffect(() => {
  //   if (socketRef.current) {
  //     socketRef.current.on("user-type-changed", ({ username }) => {
  //       console.log(`${username} is typing...`);
  //       if (editorRef.current) { // editorRef should reference your TinyMCE editor instance
  //         editorRef.current.notificationManager.open({
  //           text: `${username} typed`,
  //           type: "info",
  //           timeout: 1000, 
  //         });
  //       }
  //     });
  //   }
  // }, [socketRef.current]);

  const handleCreateRoom = async () => {
    const roomId=`room-${Date.now()}`
    setRoomId(roomId)
    socketRef.current=setupWebSocket(roomId,setUsersInRoom,setContent,user?.displayName)
  }
  const handleJoinRoom = async (inputRoomId) => {
    const roomId = inputRoomId.startsWith("room-") ? inputRoomId : `room-${inputRoomId}`;
    setRoomId(roomId);
    socketRef.current=setupWebSocket(roomId,setUsersInRoom,setContent,user?.displayName)
  }
  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setRoomId(null);
    setUsersInRoom([]);
    alert("You have left the room.");
  };
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
          <div className="typing-status text-sm italic text-gray-500 mt-2">
            {typingStatus}
          </div>
        </h2>
        <CollabButton onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        {roomId &&(
          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <strong>Collab Room:</strong> {roomId} ({usersInRoom.length} users)
            <button onClick={handleLeaveRoom} className="bg-red-600 text-white px-2 py-1 rounded-lg ml-4">
              Leave Room
            </button>
          </div>
        )}
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
          onInit={(evt, editor) => {
            if (!socketRef.current) {
              socketRef.current = editor;
            }
            // editor.on("keydown", () => {
            //   if (socketRef.current && roomId) {
            //     socketRef.current.emit("user-typing", {
            //       roomId,
            //       username: user?.displayName,
            //     });
            //   }
            // });
          }}

          value={content}
          onEditorChange={(newContent) => {
            setContent(newContent);
            if (socketRef.current && roomId) {
              socketRef.current.emit("send-content", { roomId, content: newContent });
            }
            else{
              console.log("No room set for content update");
            }
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
