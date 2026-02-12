import express from 'express';
import { createRoom, joinRoom, deleteRoom } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes are protected! 🔒
router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.delete('/:roomId', protect, deleteRoom);

export default router;