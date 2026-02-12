import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected! The user must send a valid token.
router.get('/profile', protect, getUserProfile);

export default router;