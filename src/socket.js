import { io } from 'socket.io-client';

// ❌ OLD: const URL = 'http://localhost:5000';
// ✅ NEW: Leave URL undefined. It defaults to window.location.host

export const socket = io({ 
  autoConnect: false,
  // We use the standard path. Ensure backend uses this too.
  path: '/socket.io', 
  transports: ['websocket', 'polling']
});