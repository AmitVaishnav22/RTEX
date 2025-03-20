import { createSlice } from "@reduxjs/toolkit";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const initialState = {
  user: null,
  firebaseToken: null, 
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setFirebaseToken: (state, action) => {
      state.firebaseToken = action.payload; 
    },
    logoutUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;


export const checkAuthState = () => async (dispatch) => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      dispatch(setUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }));
      const token = await user.getIdToken(true);
      dispatch(setFirebaseToken(token));
    } else {
      dispatch(logoutUser());
    }
  });
};