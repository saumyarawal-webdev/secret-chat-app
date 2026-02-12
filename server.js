import express from 'express'
import apiRoutes from './api/routes.js'
import { setupFrontend } from './vite-setup.js' // Import the magic

const app = express()
const PORT = process.env.PORT || 5173

async function startServer() {
  
  // --- 1. USER CONFIGURATION SECTION ---
  // (You can safely edit this part!)
  
  app.use(express.json()) // JSON Parser
  
  // Mount your API routes BEFORE the frontend
  app.use('/api', apiRoutes)

  // -------------------------------------


  // --- 2. BOILERPLATE SECTION ---
  // (Do not touch. This sets up Vite/Static files)
  await setupFrontend(app)


  // --- 3. START SERVER ---
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

startServer()
export default app