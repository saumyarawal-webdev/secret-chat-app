import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRoom: null,      // The full room object (id, code, creator, etc.)
  messages: [],          // Array of chat messages
  isConnected: false,    // Socket connection status
  isTyping: false,       // Is the other agent typing?
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set the room details when we enter
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    // Socket connects
    setSocketConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    // Add a single message (real-time or own send)
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    // Load initial history (if any)
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    // Handle typing indicator
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    },
    // Clear chat on leave
    resetChat: (state) => {
      state.activeRoom = null;
      state.messages = [];
      state.isConnected = false;
      state.isTyping = false;
    }
  },
});

export const { 
  setActiveRoom, 
  setSocketConnected, 
  addMessage, 
  setMessages, 
  setTypingStatus,
  resetChat 
} = chatSlice.actions;

export default chatSlice.reducer;