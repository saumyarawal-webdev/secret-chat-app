import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Simple check: Do we have the key?
  const token = localStorage.getItem('token');

  // If no token, redirect to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If yes, let them through (Render the Child Route)
  return <Outlet />;
};

export default ProtectedRoute;