import ChatRoom from './api/models/ChatRoom.js'; 

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket Connected: ${socket.id}`);

    // 1. Join Room (SECURED 🛡️)
    socket.on('join_room', async (data) => {
      
      // Handle data format
      const roomCode = typeof data === 'object' ? (data.roomCode || data.roomId) : data;
      const userId = typeof data === 'object' ? data.userId : null;

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

        // --- 🦍 THE NEW BOUNCER CHECK (Schema Fixed) ---
        
        // Convert DB IDs to strings for comparison
        const creatorId = room.creator ? room.creator.toString() : null;
        const partnerId = room.partner ? room.partner.toString() : null;

        console.log(`📋 Room Access List -> Creator: ${creatorId}, Partner: ${partnerId}`);
        console.log(`👤 Checking Authorization for: ${userId}`);

        // Check if the user is EITHER the creator OR the partner
        const isCreator = creatorId === userId;
        const isPartner = partnerId === userId;

        if (!isCreator && !isPartner) {
          console.log(`⛔ BLOCK: User ${userId} is neither Creator nor Partner.`);
          socket.emit('auth_error', { message: 'ACCESS DENIED: You are not a participant.' });
          return; 
        }

        // --- SUCCESS ---
        console.log(`✅ SUCCESS: User ${userId} joined room ${roomCode}`);
        socket.join(roomCode);
        socket.to(roomCode).emit('user_joined', { id: socket.id });

      } catch (error) {
        console.error("💥 CRASH in join_room:", error);
        socket.emit('auth_error', { message: 'Server Error during Join' });
      }
    });

    // 2. Send Message
    socket.on('send_message', (data, callback) => {
      socket.to(data.room).emit('receive_message', data);
      if (callback) callback({ status: 'ok' }); 
    });

    // 3. Typing Indicators
    socket.on('typing', (roomCode) => {
      socket.to(roomCode).emit('display_typing');
    });

    socket.on('stop_typing', (roomCode) => {
      socket.to(roomCode).emit('hide_typing');
    });

    // 4. Message Read Status
    socket.on('mark_read', (data) => {
        socket.to(data.room).emit('message_read', data.messageId);
    });

    // 5. Smart Disconnect
    socket.on('disconnecting', () => {
      const rooms = [...socket.rooms]; 
      rooms.forEach((room) => {
        socket.to(room).emit('user_left', { id: socket.id });
      });
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected 🔴', socket.id);
    });
  });
};