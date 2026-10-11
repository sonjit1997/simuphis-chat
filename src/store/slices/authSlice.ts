import { User } from "@/types/chat";
import { CURRENT_USER } from "@/mock/initialData";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

// Check localStorage in browser for persisted session
const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return CURRENT_USER;
  try {
    const saved = localStorage.getItem("simuphish_user_session");
    if (saved) return JSON.parse(saved);
  } catch {}
  return CURRENT_USER;
};

const initialUser = getInitialUser();

const initialState: AuthState = {
  currentUser: initialUser,
  isAuthenticated: !!initialUser,
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
