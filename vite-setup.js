// ⚠️ DO NOT MODIFY THIS FILE ⚠️
// This file handles the connection between Express and Vite.
// It automatically serves your frontend in both Dev and Prod modes.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

export async function setupFrontend(app) {
  // ---------------------------------------------------------
  // 🚀 PRODUCTION MODE (Vercel / Render)
  // ---------------------------------------------------------
  if (isProduction) {
    console.log('🚀 Running in PRODUCTION mode')

    // Serve static files from the 'dist' folder
    app.use(express.static(path.resolve(__dirname, 'dist')))

    // SPA Fallback: Matches ANY route and sends index.html
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
    })
  }

  // ---------------------------------------------------------
  // 🛠️ DEVELOPMENT MODE (Localhost)
  // ---------------------------------------------------------
  else {
    console.log('🛠️ Running in DEVELOPMENT mode')
    
    // Dynamic import: Only load Vite in dev mode!
    const { createServer: createViteServer } = await import('vite')

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })

    // Use Vite's connect instance as middleware
    app.use(vite.middlewares)

    // Serve index.html with Vite's transformations
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
  }
}