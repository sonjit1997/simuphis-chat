import { User } from "@/types/chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  users: User[];
  status: "idle" | "loading" | "succeeded";
}

const initialState: UsersState = {
  users: [],
  status: "idle",
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.status = "succeeded";
    },
    addUser: (state, action: PayloadAction<User>) => {
      const idx = state.users.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) {
        state.users[idx] = action.payload;
      } else {
        state.users.push(action.payload);
      }
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; status: "online" | "offline" }>
    ) => {
      const user = state.users.find((u) => u.id === action.payload.userId);
      if (user) {
        user.status = action.payload.status;
      }
    },
  },
});

export const { setUsers, addUser, updateUserStatus } = usersSlice.actions;
export default usersSlice.reducer;
