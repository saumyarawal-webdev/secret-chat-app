# 🚂 React Express Boilerplate

A robust, "Monolith-style" fullstack boilerplate that unifies **Vite (React)** and **Express** into a single development experience.

> **One Terminal. One Port. Fullstack Power.**

## 🚀 Features

* **Unified Server:** `server.js` acts as the single entry point. It serves the API *and* the Frontend (via Vite middleware).
* **Smart Watchdog:** Uses `nodemon` to restart the server **only** when backend files change, while Vite handles HMR for the frontend.
* **API Ready:** Organized `api/` folder structure with Express Router.
* **Data Fetching:** Pre-configured with **Axios** and **TanStack Query (React Query)** for professional-grade state management.
* **Custom Hooks:** Clean separation of concerns with a `hooks/` directory pattern.

## 🛠️ Tech Stack

* **Frontend:** React, Vite
* **Backend:** Express.js
* **Utilities:** Axios, TanStack Query, Nodemon

## 📂 Project Structure

```text
root/
├── api/                # Backend API Routes
│   └── routes.js       # Express Router definitions
├── src/                # React Frontend
│   ├── hooks/          # Custom React Hooks (e.g., useTest.js)
│   ├── App.jsx         # Main Component
│   └── main.jsx        # Entry point with QueryProvider
├── server.js           # The Engine (Express + Vite Middleware)
├── package.json        # Scripts and Dependencies
└── ...
```



## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone [https://github.com/saumyarawal-webdev/react-express.git](https://github.com/saumyarawal-webdev/react-express.git)
cd react-express-boilerplate
npm install
```
### 2. Start the Engine 🚂
Run the development environment. This starts the Express server and the Vite middleware together.

```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **API Endpoint:** `http://localhost:5173/api/test`

### 3. Build for Production
When ready to deploy, build the React app. The server is configured to serve the static files in production (requires minor `dist` folder config in server.js for final deploy).

```bash
npm run build
```
## 🧩 How to Add a New API

1. **Backend:** Add a new route in `api/routes.js`:
    ```javascript
    router.get('/users', (req, res) => { ... })
    ```
2. **Frontend:** Create a hook in `src/hooks/useUsers.js` using Axios + useQuery.
3. **UI:** Import the hook in your component and display the data.

---
*Made with 💙 by Saumya*