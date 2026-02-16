import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// --- 1. IMPORTS: Database & Routes ---
import connectDB from './api/lib/connect.js'
import apiRoutes from './api/routes.js'

// --- 2. IMPORTS: Socket.io ---
import { createServer } from 'http'
import { Server } from 'socket.io'
import { initializeSocket } from './socket.js'

// --- 3. CONFIGURATION ---
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 5173

const app = express()
const httpServer = createServer(app)

// --- 4. SOCKET SETUP (Works on Render/Local, Ignored on Vercel) ---
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from any domain (Safe for Monolith)
    methods: ["GET", "POST"]
  }
})
initializeSocket(io)

// --- 5. MIDDLEWARE & DB ---
app.use(express.json())
connectDB() // Connect to Mongo

// Request Logger (Optional: Helps debug)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`🔍 API Request: ${req.method} ${req.path}`)
  }
  next()
})

// --- 6. API ROUTES (Must be before Frontend!) ---
app.use('/api', apiRoutes)

// --- 7. FRONTEND SERVING LOGIC (Merged) ---
if (isProduction) {
  // 🚀 PRODUCTION (Vercel / Render)
  console.log('🚀 Running in PRODUCTION mode')

  // Serve static files from 'dist'
  app.use(express.static(path.resolve(__dirname, 'dist')))

  // SPA Fallback: Send index.html for unknown routes
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  })

} else {
  // 🛠️ DEVELOPMENT (Localhost)
  // We use an async wrapper here because importing Vite is async
  (async () => {
    console.log('🛠️ Running in DEVELOPMENT mode')
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })

    app.use(vite.middlewares)
    app.use(async (req, res, next) => {
      const url = req.originalUrl
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
      } catch (e) {
        vite.ssrFixStacktrace(e)
        next(e)
      }
    })
  })()
}

// --- 8. START SERVER ---
// Only listen if we are NOT on Vercel. 
// Vercel exports the app and handles the port itself.
if (process.env.VERCEL !== '1') {
  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

// --- 9. EXPORT FOR VERCEL ---
export default app