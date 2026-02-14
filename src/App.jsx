import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <div className="bg-app-bg min-h-screen text-text-main font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
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