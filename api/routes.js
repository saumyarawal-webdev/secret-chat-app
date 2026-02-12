import express from 'express'
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
const router = express.Router()

// Auth Routes
router.use('/auth', authRoutes);

// Chat Routes
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);
// Just '/test' here. The '/api' part happens in server.js
router.get('/test', (req, res) => {
  res.json({ message: 'Hello from backend....!!' })
})

export default router