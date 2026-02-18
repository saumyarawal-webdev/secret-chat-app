import Room from './api/models/Room.js'; // 1. Import the Model for the Bouncer

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id} 🟢`);

    // 1. Join Room (SECURED 🛡️)
    // We now expect an object: { roomCode, userId }
    socket.on('join_room', async (data) => {
      
      // Handle both cases: if data is just a string (old way) or object (new way)
      const roomCode = typeof data === 'object' ? data.roomCode || data.roomId : data;
      const userId = typeof data === 'object' ? data.userId : null;

      try {
        // --- 🦍 THE BOUNCER CHECK START ---
        
        // 1. If no ID provided, block immediately
        if (!userId) {
          console.log(`⛔ Access Denied: Missing User ID for room ${roomCode}`);
          socket.emit('auth_error', { message: 'Authentication required' });
          return;
        }

        // 2. Check the Database
        const room = await Room.findById(roomCode);
        
        // 3. Validation: Does room exist? Is User in the participants list?
        if (!room) {
           socket.emit('auth_error', { message: 'Room not found' });
           return;
        }

        const isAuthorized = room.participants.some(p => p.toString() === userId);

        if (!isAuthorized) {
           console.log(`⛔ SECURITY ALERT: Unauthorized join attempt by ${userId} in room ${roomCode}`);
           socket.emit('auth_error', { message: 'ACCESS DENIED: You are not a participant.' });
           return; // 🛑 STOP HERE. Do not let them join.
        }
        
        // --- 🦍 THE BOUNCER CHECK END ---

        // If we passed the bouncer, proceed as normal:
        socket.join(roomCode);
        console.log(`User ${socket.id} joined room: ${roomCode}`);
        
        // Notify the room that a partner has connected
        socket.to(roomCode).emit('user_joined', { id: socket.id });

      } catch (error) {
        console.error("Socket Join Error:", error);
        socket.emit('auth_error', { message: 'Internal Server Error' });
      }
    });

    // 2. Send Message (With Acknowledgment for "One Tick")
    socket.on('send_message', (data, callback) => {
      // data: { room, message, sender, time, id }
      
      // Forward message to the partner (triggers "Two Ticks" for them if they receive it)
      socket.to(data.room).emit('receive_message', data);
      
      // CONFIRMATION: Run the client's callback to confirm server received it.
      // This tells the sender: "Server got it. Show One Tick. ✅"
      if (callback) callback({ status: 'ok' }); 
    });

    // 3. Typing Indicators ⚡
    socket.on('typing', (roomCode) => {
      socket.to(roomCode).emit('display_typing');
    });

    socket.on('stop_typing', (roomCode) => {
      socket.to(roomCode).emit('hide_typing');
    });

    // 4. Message Read Status (Blue Ticks) 🔵
    socket.on('mark_read', (data) => {
        // data: { room, messageId }
        // Tell the *original sender* that their message was read
        socket.to(data.room).emit('message_read', data.messageId);
    });

    // 5. Smart Disconnect Handling 🔴
    socket.on('disconnecting', () => {
      // We use 'disconnecting' because we can still see the rooms they are in!
      const rooms = [...socket.rooms]; // Get all rooms the user is in
      rooms.forEach((room) => {
        // Notify everyone in the room that this user is leaving
        socket.to(room).emit('user_left', { id: socket.id });
      });
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected 🔴', socket.id);
    });
  });
};