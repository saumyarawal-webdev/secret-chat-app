import ChatRoom from './api/models/ChatRoom.js'; // 1. Import the Model for the Bouncer

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id} 🟢`);

    // 1. Join Room (SECURED 🛡️)
    // We now expect an object: { roomCode, userId }
    socket.on('join_room', async (data) => {
      // 1. Log EXACTLY what the frontend sent
      console.log(`🔍 DEBUG JOIN REQUEST:`, JSON.stringify(data));

      // Handle data format
      const roomCode = typeof data === 'object' ? (data.roomCode || data.roomId) : data;
      const userId = typeof data === 'object' ? data.userId : null;

      console.log(`📝 Parsed Data -> Room: ${roomCode}, User: ${userId}`);

      try {
        if (!userId) {
          console.log(`❌ BLOCK: Missing userId`);
          socket.emit('auth_error', { message: 'Missing User ID' });
          return;
        }

        const room = await ChatRoom.findById(roomCode);
        
        if (!room) {
          console.log(`❌ BLOCK: Room ${roomCode} not found in DB`);
          socket.emit('auth_error', { message: 'Room not found' });
          return;
        }

        // Log the participants list from DB to see if we are in it
        console.log(`📋 Room Participants:`, room.participants.map(p => p.toString()));
        console.log(`👤 Checking Authorization for: ${userId}`);

        const isAuthorized = room.participants.some(p => p.toString() === userId);

        if (!isAuthorized) {
          console.log(`⛔ BLOCK: User is NOT in the participants list.`);
          socket.emit('auth_error', { message: 'Not Authorized' });
          return; 
        }

        // --- SUCCESS ---
        console.log(`✅ SUCCESS: User ${userId} joined room ${roomCode}`);
        socket.join(roomCode);
        socket.to(roomCode).emit('user_joined', { id: socket.id });

      } catch (error) {
        console.error("💥 CRASH in join_room:", error);
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