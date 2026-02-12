import ChatRoom from '../models/ChatRoom.js';
import crypto from 'crypto';

// Helper to generate 5-char code
const generateCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
};

export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;

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
    const userId = req.user.id;

    // 1. Find the room
    const room = await ChatRoom.findOne({ code: code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Secret code not found.' });
    }

    if (room.status === 'active') {
      return res.status(400).json({ message: 'This chat is already full.' });
    }

    if (room.creator.toString() === userId) {
      return res.status(400).json({ message: 'You cannot join your own secret code.' });
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

export const deleteRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params; // We will pass the DB _id in the URL

   const room = await ChatRoom.findOne({ code: roomId.toUpperCase() });

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