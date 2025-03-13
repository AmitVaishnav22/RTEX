import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser } from "../store/authslice.js";
import { getAuthenticatedUser, logOut } from "../auth/firebase.js";
import { getAuth } from "firebase/auth";
import { Trash2 } from "lucide-react";

const LeftBar = ({ onSelectLetter ,onCreateNewLetter,fetchLetters,letters}) => {
  const user = useSelector((state) => state.auth.user);
  // const [letters, setLetters] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  // const fetchLetters = async () => {
  //   try {
  //     const auth = getAuth();
  //     const user = await getAuthenticatedUser();

  //     if (!user) {
  //       console.error("❌ No authenticated user found.");
  //       return;
  //     }
  //     const firebaseToken = await user.getIdToken();
  //     //console.log("🔥 Firebase Token Retrieved:", firebaseToken);

  //     const response = await axios.get("http://localhost:7000/letter", {
  //       headers: { Authorization: `Bearer ${firebaseToken}` },
  //     });

  //     setLetters(response.data);
  //   } catch (error) {
  //     console.error("❌ Error fetching letters:", error);
  //   }
  // };
  const handleDeleteLetter = async (letterId) => {
    try {
      const auth = getAuth();
      const user = await getAuthenticatedUser();
  
      if (!user) {
        alert("User not authenticated.");
        return;
      }
  
      const firebaseToken = await user.getIdToken();
  
      await axios.delete(`http://localhost:7000/letter/delete/${letterId}`, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
      });
  
      alert("Letter deleted successfully!");
      fetchLetters(); 
    } catch (error) {
      console.error("Error deleting letter:", error.response?.data || error);
      alert("Failed to delete letter.");
    }
  };
  

  const handleLogout = async () => {
    await logOut();
    dispatch(logoutUser());
    navigate("/");
    console.log("User logged out, Redux cleared.");
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 min-h-screen">
      {/*User Profile Info */}
      {user && (
        <div className="mb-4 text-center">
          <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full mx-auto mb-2" />
          <h3 className="text-lg">{user.displayName}</h3>
          <p className="text-sm">{user.email}</p>
        </div>
      )}

      <button
        onClick={onCreateNewLetter}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg mb-4 w-full"
      >
        + Create New Letter
      </button>

      {/* Saved Letters */}
      <h3 className="text-lg mb-2">Saved Letters</h3>
      <ul>
        {letters.length === 0 ? (
          <p className="text-gray-400 text-sm">No saved letters yet.</p>
        ) : (
          letters.map((letter) => (
            <li key={letter._id} className="flex justify-between items-center p-2 hover:bg-gray-700 cursor-pointer rounded">
              <span onClick={() => onSelectLetter(letter)} className="flex-grow">{letter.title}</span>
              <button
                onClick={() => handleDeleteLetter(letter._id)}
                className="bg-grey-600 hover:bg-red-700 text-white p-1 rounded-full"
              >
                <Trash2 size={16} strokeWidth={2} className="text-white" /> {/*Clean white icon */}
              </button>
            </li>
          ))
        )}
      </ul>
      <button onClick={handleLogout} className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
    </div>
  );
};

export default LeftBar; 
