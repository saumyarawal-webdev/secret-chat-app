// socket.js
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id} 🟢`);

    // 1. Join Room
    socket.on('join_room', (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room: ${roomCode}`);
      // Notify the room that a partner has connected
      socket.to(roomCode).emit('user_joined', { id: socket.id });
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