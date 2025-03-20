import React, { useState, useRef } from "react";

const CollabButton = ({ onCreateRoom, onJoinRoom }) => {
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const roomIdRef = useRef(null);

  return ( 
    <div className="relative">
      {/* Collaboration Button */}
      <button
        onClick={() => setIsCollabOpen(true)} 
        className="bg-white-600 text-white px-1 py-2 rounded-full w-full"
        title="collab-mode"
      >
        <img 
            src="https://cdn.iconscout.com/icon/premium/png-512-thumb/add-member-526606.png" 
            alt="collab-mode" 
            className="w-12 h-12 rounded-full object-contain"
          />
      </button>

      {/* Modal for Room Creation and Joining */}
      {isCollabOpen && (
        <div className="absolute top-16 right-0 bg-white p-4 shadow-lg rounded-lg w-80 z-10">
          <h2 className="text-xl font-bold mb-4">Collaboration</h2>
          
          <button
            onClick={() => {
              onCreateRoom();
              setIsCollabOpen(false);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full mb-2"
          >
            Create Room
          </button>

          <input
            type="text"
            placeholder="Enter Room ID"
            ref={roomIdRef}
            className="border p-2 w-full mb-2"
          />

          <button
            onClick={() => {
              if (roomIdRef.current.value.trim()) {
                onJoinRoom(roomIdRef.current.value.trim());
                setIsCollabOpen(false);
              } else {
                alert("Enter a valid Room ID");
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Join Room
          </button>

          <button
            onClick={() => setIsCollabOpen(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg w-full mt-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CollabButton;


