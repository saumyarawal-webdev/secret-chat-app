import express from 'express'
const router = express.Router()

// Just '/test' here. The '/api' part happens in server.js
router.get('/test', (req, res) => {
  res.json({ message: 'Hello from backend....!!' })
})

export default router