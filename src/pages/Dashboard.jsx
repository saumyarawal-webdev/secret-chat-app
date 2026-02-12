import React from 'react';
import { useUser } from '../hooks/useUser';
import { LogOut, Plus, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data: user, isLoading, isError } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">Failed to load agent profile.</p>
        <button onClick={handleLogout} className="text-primary hover:underline">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20"> 
      {/* 1. Header Section */}
      <header className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Shield size={120} className="text-white" />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Welcome Agent</h1>
            <h2 className="text-3xl font-bold text-white">{user?.username || 'Unknown'}</h2>
            <p className="text-white/60 text-sm mt-1 font-mono">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <LogOut size={20} className="text-white" />
          </button>
        </div>
      </header>

      {/* 2. Content Section (Overlapping Header) */}
      <div className="px-6 -mt-12 relative z-20 space-y-6">
        
        {/* Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase font-bold tracking-wide">Current Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800">Online & Encrypted</span>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            ID: {user?._id?.slice(-6)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-primary/50 transition-all group flex flex-col items-center gap-3 active:scale-95">
            <div className="bg-blue-50 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
              <Plus size={28} />
            </div>
            <span className="font-bold text-slate-700">New Room</span>
          </button>

          <button className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-secondary/50 transition-all group flex flex-col items-center gap-3 active:scale-95">
            <div className="bg-pink-50 p-4 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors text-secondary">
              <Users size={28} />
            </div>
            <span className="font-bold text-slate-700">Join Room</span>
          </button>
        </div>

        {/* Recent History (Placeholder) */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 ml-1">Recent Operations</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-slate-400 text-sm">No recent secure channels found.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;