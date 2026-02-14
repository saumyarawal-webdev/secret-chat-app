import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRoom: null,
  messages: [],
  isConnected: false,
  isTyping: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    // 👇 ADD THIS NEW REDUCER
    markMessageAsRead: (state, action) => {
      // action.payload should be the message ID
      const message = state.messages.find(msg => msg.id === action.payload);
      if (message) {
        message.read = true;
      }
    },
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    },
    resetChat: (state) => {
      return initialState;
    }
  },
});

export const { 
  setSocketConnected, 
  addMessage, 
  markMessageAsRead, // Export it!
  setTypingStatus,
  resetChat 
} = chatSlice.actions;

export default chatSlice.reducer;