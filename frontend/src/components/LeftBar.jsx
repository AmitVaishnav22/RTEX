import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../store/authslice.js";
import { getAuthenticatedUser, logOut } from "../auth/firebase.js";
import { getAuth } from "firebase/auth";
import { Trash2 } from "lucide-react";
import LetterMoreOptions from "./LetterMoreOptions.jsx";

const LeftBar = ({ onSelectLetter ,onCreateNewLetter,fetchLetters,letters,loading}) => {
  //console.log("LeftBar component rendered");
  //console.log(loading)
  const user = useSelector((state) => state.auth.user);
  console.log("User in LeftBar:", letters);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDeleteLetter = async (letterId) => {
    try {
      const auth = getAuth();
      const user = await getAuthenticatedUser();
  
      if (!user) {
        alert("User not authenticated.");
        return;
      }
  
      const firebaseToken = await user.getIdToken();
  
      await axios.delete(`https://rtex-1.onrender.com/letter/delete/${letterId}`, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
      });
  
      alert("Letter deleted successfully!"); 
      fetchLetters(); 
    } catch (error) {
      console.error("Error deleting letter:", error.response?.data || error);
      alert("Failed to delete workspace.");
    }
  };

  const handlePublishLetter = async (letterId) => {
    try {
      const auth = getAuth();
      const user = await getAuthenticatedUser();
      //console.log("User in handlePublishLetter:", user);
      if (!user) {
        alert("User not authenticated.");
        return;
      }
      const firebaseToken = await user.getIdToken();
      console.log("Firebase token:", firebaseToken);
      const response = await axios.post(
        `https://rtex-1.onrender.com/letter/publish/${letterId}`,
        {},
        {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        }
      );
      const newTab = window.open(response.data.publicUrl, "_blank");
      if (!newTab) {
        alert("Popup blocked! Please allow popups for this site.");
      } else {
        newTab.focus();
      }
      alert("WorkSpace published successfully!");
      fetchLetters();
    } catch (error) {
      console.error("Error publishing letter:", error.response?.data || error);
      alert("Failed to publish workspace.");
    }
  }
  

  const handleLogout = async () => {
    await logOut();
    dispatch(logoutUser());
    navigate("/");
    //console.log("User logged out, Redux cleared.");
  };

  const onToggleVisibility = async (letterId) => {
    try {
      const auth = getAuth();
      const user = await getAuthenticatedUser();
      if (!user) {
        alert("User not authenticated.");
        return;
      }
      console.log(letterId);
      const firebaseToken = await user.getIdToken();
      console.log("Firebase token:", firebaseToken);
      const response = await axios.put(
        `https://rtex-1.onrender.com/letter/toggle-visibility/${letterId}`,
        {},
        {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        }
      );
      alert(response.data.message);
      // fetchLetters();
    } catch (error) {
      console.error("Error toggling visibility:", error.response?.data || error);
      alert("Failed to toggle visibility.");
    }
  }
  const onSetPasscode = async (letterId, newPasscode) => {
    try {
      const auth = getAuth();
      const user = await getAuthenticatedUser();
      if (!user) {
        alert("User not authenticated.");
        return;
      }

      //console.log("Letter ID:", letterId, "New Passcode:", newPasscode);

      const firebaseToken = await user.getIdToken();
      //console.log("Firebase token:", firebaseToken);

      const response = await axios.put(
        `https://rtex-1.onrender.com/letter/set-passcode/${letterId}`,
        { passcode: newPasscode }, // <-- body with passcode
        {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        }
      );

      alert(response.data.message);
      fetchLetters(); // optionally refresh UI
    } catch (error) {
      console.error("Error setting passcode:", error.response?.data || error);
      alert("Failed to set/change passcode.");
    }
  };

  return (
    <>
     <div className="w-64 bg-gray-800 text-white p-4 min-h-screen flex flex-col">
      {/* User Profile Info */}
      {user && (
        <div className="mb-4 text-center">
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-16 h-16 rounded-full mx-auto mb-2"
          />
          <h3 className="text-lg">{user.displayName}</h3>
          <p className="text-sm">{user.email}</p>
        </div>
      )}

      <button
        onClick={onCreateNewLetter}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-4 w-full"
      >
        + New WorkSpace
      </button>

      {/* Saved Letters */}
      <h3 className="text-lg mb-2">Saved Works</h3>
      <div className="flex-grow overflow-auto">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ):
        <ul>
          {letters.length === 0 ? (
            <p className="text-gray-400 text-sm">No saved works yet.</p>
          ) : (
            letters.map((letter) => (
              <li
                key={letter._id}
                className="flex justify-between items-center p-2 hover:bg-gray-700 cursor-pointer rounded"
              >
                <span onClick={() => onSelectLetter(letter)} className="flex-grow">
                  {letter.title}
                </span>
                <LetterMoreOptions
                    letter={letter}
                    onDelete={handleDeleteLetter}
                    onPublish={handlePublishLetter}
                    onToggleVisibility={onToggleVisibility}
                    onSetPasscode={onSetPasscode}
                  />
              </li>
            ))
          )}
          </ul>
        }
      </div>
      
      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  </>
  );
};

export default LeftBar; 
