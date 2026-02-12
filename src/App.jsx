import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  return (
    <div className="bg-app-bg min-h-screen text-text-main font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          {/* We will add /chat/:id here later */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;