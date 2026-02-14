import 'dotenv/config'
import express from 'express'
import connectDB from './api/lib/connect.js'
import apiRoutes from './api/routes.js'
import { setupFrontend } from './vite-setup.js' // Import the magic

// socket imports
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import { initializeSocket } from './socket.js';
const app = express()
const PORT = process.env.PORT || 5173

// --- SOCKET SETUP ---
// 1. Create HTTP server wrapper
const httpServer = createServer(app);

// 2. Initialize IO with CORS
const io = new Server(httpServer);

// 3. Inject IO into our Logic Handler
initializeSocket(io); 
// --------------------

async function startServer() {
  
  // --- 1. USER CONFIGURATION SECTION ---
  // (You can safely edit this part!)
  // Connect to Database
  await connectDB()

  app.use((req, res, next) => {
    // Only log API requests to keep logs clean
    if (req.path.startsWith('/api')) {
      console.log(`🔍 API Request: ${req.method} ${req.path}`);
    }
    next();
  });

  app.use(express.json()) // JSON Parser
  
  // Mount your API routes BEFORE the frontend
  app.use('/api', apiRoutes)

  // -------------------------------------


  // --- 2. BOILERPLATE SECTION ---
  // (Do not touch. This sets up Vite/Static files)
  await setupFrontend(app)


  // --- 3. START SERVER ---
  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

startServer()


export default app