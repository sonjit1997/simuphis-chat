import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DraftsState {
  draftsByConversationId: Record<string, string>;
}

const initialState: DraftsState = {
  draftsByConversationId: {},
};

export const draftsSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    setDraft: (
      state,
      action: PayloadAction<{ conversationId: string; text: string }>
    ) => {
      const { conversationId, text } = action.payload;
      if (!text || text.trim() === "") {
        delete state.draftsByConversationId[conversationId];
      } else {
        state.draftsByConversationId[conversationId] = text;
      }
    },
    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.draftsByConversationId[action.payload];
    },
  },
});

export const { setDraft, clearDraft } = draftsSlice.actions;
export default draftsSlice.reducer;
