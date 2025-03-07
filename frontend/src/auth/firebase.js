import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCsUlVCSkNWlG_tnsNiYigwW0PcpXdQEbw",
    authDomain: "rtex-b398b.firebaseapp.com",
    projectId: "rtex-b398b",
    storageBucket: "rtex-b398b.firebasestorage.app",
    messagingSenderId: "617088985418",
    appId: "1:617088985418:web:bac4b46a34b949cba679b3",
    measurementId: "G-VNJKH6MNPJ"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-In function
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User:", result.user);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

// Logout function
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

export { auth, signInWithGoogle, logOut };
