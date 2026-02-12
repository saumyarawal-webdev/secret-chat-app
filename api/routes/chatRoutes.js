import express from 'express';
import { createRoom, joinRoom, deleteRoom, getMyRooms } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes are protected! 🔒
router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.delete('/:roomId', protect, deleteRoom);
router.get('/my-rooms', protect, getMyRooms);
export default router;