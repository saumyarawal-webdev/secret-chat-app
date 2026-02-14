import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
function App() {
  return (
    <div className="bg-app-bg min-h-screen text-text-main font-sans">
      <Routes>
        {/* Public Routes Wrapper */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;