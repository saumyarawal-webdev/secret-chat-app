import { io } from 'socket.io-client';

// 1. Point this to your Backend URL
// If you deploy later, change this to your production domain
const URL = 'http://localhost:5173'; 

// 2. Create the Socket Instance
// autoConnect: false -> We wait until the user logs in to connect manually
export const socket = io(URL, {
  autoConnect: false,
});