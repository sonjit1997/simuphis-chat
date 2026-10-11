import { User } from "@/types/chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

// Initial state must be identical on server and client to prevent hydration mismatches
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("simuphish_user_session", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("simuphish_user_session");
        }
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("simuphish_user_session");
      }
    },
  },
});

export const { setCurrentUser, logout } = authSlice.actions;
export default authSlice.reducer;
