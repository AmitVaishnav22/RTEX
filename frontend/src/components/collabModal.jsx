import React, { useState } from "react";


const CollabModal = ({ onClose, onJoinRoom, onCreateRoom }) => {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">Collaboration</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full" onClick={onCreateRoom}>
          Create a Collab Room
        </button>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={() => onJoinRoom(roomId)}>
          Join Room
        </button>
        <button className="mt-4 text-gray-600" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CollabModal;
