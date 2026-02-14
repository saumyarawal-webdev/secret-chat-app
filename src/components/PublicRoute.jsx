import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Loader2 } from 'lucide-react';

const PublicRoute = () => {
  const { data: user, isLoading } = useUser();

  // 1. Wait for the check
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-primary">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // 2. If user exists, kick them to Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3. Otherwise, show the Login page
  return <Outlet />;
};

export default PublicRoute;