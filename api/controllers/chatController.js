import ChatRoom from '../models/ChatRoom.js';
import crypto from 'crypto';

// Helper to generate 5-char code
const generateCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
};

export const createRoom = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check if user already has an active/waiting room
    const existingRoom = await ChatRoom.findOne({ 
      $or: [{ creator: userId }, { partner: userId }] 
    });
    
    if (existingRoom) {
      return res.status(400).json({ message: 'You already have an active chat session.' });
    }

    // 2. Generate Unique Code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const check = await ChatRoom.findOne({ code });
      if (!check) isUnique = true;
    }

    // 3. Create Room
    const newRoom = await ChatRoom.create({
      code,
      creator: userId,
      status: 'waiting'
    });

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    // 1. Find the room
    const room = await ChatRoom.findOne({ code: code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Secret code not found.' });
    }

    if (room.status === 'active') {
      return res.status(400).json({ message: 'This chat room is already full.' });
    }

    if (room.creator.toString() === userId) {
      return res.status(400).json({ message: 'You cannot join your own secret room. Send the code to a friend!' });
    }

    // 2. Update room to active
    room.partner = userId;
    room.status = 'active';
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find rooms where the user is the creator OR the partner
    // We sort by 'updatedAt' so the most recent operation is at the top
    const rooms = await ChatRoom.find({
      $or: [
        { creator: userId }
      ]
    })
    .sort({ updatedAt: -1 })
    .populate("creator", "username email") // Optional: to show who created it
    .populate("partner", "username email");

    res.status(200).json(rooms);
  } catch (error) {
    console.error("❌ Fetch Rooms Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve secure channels" });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params; // We will pass the DB _id in the URL

   const room = await ChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    // Guard: Only the creator can delete the room
    if (room.creator.toString() !== userId) {
      return res.status(401).json({ message: 'Unauthorized. Only the creator can delete this room.' });
    }

    await ChatRoom.findByIdAndDelete(roomId);

    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};