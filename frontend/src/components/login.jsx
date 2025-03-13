import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/authslice.js";

const LoginButton = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  // Redirect after login
  useEffect(() => {
    if (user) {
      navigate("/editor");
    }
  }, [user, navigate]); 

  const handleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");

    try {
      console.log("🔵 Attempting sign-in with Google...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        console.error("User not found after sign-in!");
        return;
      }

      console.log("User from Firebase:", user);

      // Dispatch user data to Redux
      dispatch(setUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }));

      console.log("User data dispatched to Redux:", user);

      // Get Firebase token
      const firebaseToken = await user.getIdToken();
      console.log("Firebase Token Retrieved:", firebaseToken);

      // Get Google OAuth token from Firebase
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        console.error("No Google credentials received!");
        return;
      }

      const googleAccessToken = credential.accessToken;
      if (!googleAccessToken) {
        console.error("Google OAuth Token is missing!");
        return;
      }

      console.log("Google OAuth Token Retrieved:", googleAccessToken);

      // Send Firebase & Google token to backend
      console.log("Sending tokens to backend...");
      const response = await axios.post("http://localhost:7000/auth/google/callback", {
        googleAccessToken
      }, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
      });

      console.log("Backend Response:", response.data);
      console.log("Google Drive authentication completed!");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <div>
      {user ? (
        <p>Redirecting...</p> 
      ) : (
        <button onClick={handleLogin}>Sign in with Google</button>
      )}
    </div>
  );
};

export default LoginButton;
