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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUsersList, setShowUsersList]=useState(false);


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
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post("http://localhost:7000/ai/generate", { text: content });
      const aiSuggestion = response.data.suggestion.trim();
      console.log(aiSuggestion)
      setContent((prevContent) => prevContent.trim()+" "+aiSuggestion);
    } catch (error) {
      console.error("Error generating AI text:", error);
    }
    setIsGenerating(false);
  };
  const editor= useRef(null);
  const username=user?.displayName;
return (
  <div className="flex h-screen">
    {/* Left Sidebar - Stays Fixed */}
    <LeftBar
      onSelectLetter={(letter) => {
        setTitle(letter.title);
        setContent(letter.content);
        setLetterId(letter._id);
      }}
      onCreateNewLetter={() => {
        setTitle("");
        setContent("");
        setLetterId(null);
      }}
      fetchLetters={fetchLetters}
      letters={letters}
    />

    <div className="flex-grow flex flex-col">
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 p-2 rounded-md w-1/4 outline-none transition"
        />
        <div className="flex items-center gap-4">

          <button onClick={handleSaveToDB} className="bg-blue-500 rounded-full text-white px-4 py-2">
            {letterId ? "update" : "save"}
          </button>
  
          <button 
            onClick={handleGenerateAI} 
            disabled={isGenerating} 
            className="relative overflow-hidden bg-blue-500 text-white px-6 py-2 rounded-full flex items-center gap-2 font-semibold transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-white to-blue-400 opacity-30 animate-shimmer"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M18.36 18.36l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M4.93 19.07l1.41-1.41"></path>  
              <path d="M18.36 5.64l1.41-1.41"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>

          <CollabButton onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
          <button onClick={handleSaveToDrive} className="relative group" title="save to google drive">
            <img 
              src="https://th.bing.com/th?id=OIP.lgdmCc6UHAWc27h0o4tSbwHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" 
              alt="Google Drive" 
              className="w-12 h-10 rounded-full object-contain"
            />
          </button>

          <button className="relative group" title="help">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/9524/9524599.png" 
              alt="Help" 
              className="w-10 h-10 rounded-full object-contain"
            />
          </button>

        </div>
      </div>
        {roomId && (
          <div className="relative">
            {/* Collab Room Info with Clickable User Count */}
            <div className="bg-gray-200 px-3 py-1 rounded-md text-sm flex items-center gap-2 mt-3">
              <strong>Collab Room:</strong> {roomId}
              <span 
                className="cursor-pointer text-blue-600 underline"
                onClick={() => setShowUsersList(!showUsersList)}
              >
                ({usersInRoom.length} users)
              </span>
            </div>
            {showUsersList && (
              <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg p-4 w-64 z-50">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
                  Users in Room
                </h3>
                <ul className="max-h-48 overflow-y-auto">
                  {usersInRoom.map((user) => (
                    <li key={user.id} className="flex items-center gap-2 py-2 border-b last:border-0">
                      <img src={user.photoURL || "https://static.vecteezy.com/system/resources/previews/013/042/571/large_2x/default-avatar-profile-icon-social-media-user-photo-in-flat-style-vector.jpg"} alt="Profile" className="w-8 h-8 rounded-full" />
                      <span className="text-gray-700">{user.username}</span>
                    </li>
                  ))}
                </ul>

                {/* Leave Room Button */}
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleLeaveRoom} 
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                  >
                    Leave Room
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      <div className="flex-grow mt-4">
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          onInit={(evt, editor) => {
            if (!socketRef.current) {
              socketRef.current = editor;
            }
          }}
          value={content}
          onEditorChange={(newContent, editor) => {
            setContent(newContent);
          
            if (editor && roomId) {
              socketRef.current.emit("send-content", { roomId, content: newContent });
  
              const selection = editor.selection;
              if (selection && selection.getRng) {
                const range = selection.getRng();
                if (range) {
                  const rects = range.getClientRects();
                  const rect = rects[0] || range.getBoundingClientRect();

                  socketRef.current.emit("send-cursor", {
                    roomId,
                    username,
                    cursorPosition: {
                      left: rect.left,
                      top: rect.top,
                    },
                  });
                }
              } else {
                console.warn("Selection API is not available yet!");
              }
            } else {
              console.log("No room set for content update");
            }
          }}
          
          onKeyUp={(evt, editor) => {
            if (editor && roomId) {
              const selection = editor.selection;
              if (selection && selection.getRng) {
                const range = selection.getRng();
                if (range) {
                  const rects = range.getClientRects();
                  const rect = rects[0] || range.getBoundingClientRect();
                  socketRef.current.emit("send-cursor", {
                    roomId,
                    username,
                    cursorPosition: {
                      left: rect.left,
                      top: rect.top,
                    },
                  });
                }
              } else {
                console.warn("Selection API is not available yet!");
              }
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
      </div>
    </div>
  </div>
);
}

export default LetterEditor;
