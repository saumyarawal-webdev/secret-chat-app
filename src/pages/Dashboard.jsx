import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { LogOut, Plus, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Logic & Components
import { useCreateRoom } from '../hooks/useCreateRoom';
import { useMyRooms } from '../hooks/useMyRooms'; 
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import RoomCard from '../components/RoomCard';

const Dashboard = () => {
  const { data: user, isLoading, isError } = useUser();
  const navigate = useNavigate();

  // --- LOGIC START ---
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  
  const { mutate: createRoom, data: newRoom, isPending: isCreating } = useCreateRoom();
  const { data: rooms, isLoading: roomsLoading } = useMyRooms(); 
  // --- LOGIC END ---

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading || roomsLoading) {
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

      {/* 2. Content Section */}
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

        {/* Action Buttons - HIDDEN IF ROOM EXISTS */}
        {rooms?.length === 0 && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => { createRoom(); setShowCreate(true); }}
              disabled={isCreating}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-primary/50 transition-all group flex flex-col items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              <div className="bg-blue-50 p-4 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <Plus size={28} className={isCreating ? "animate-spin" : ""} />
              </div>
              <span className="font-bold text-slate-700">New Room</span>
            </button>

            <button 
              onClick={() => setShowJoin(true)}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:border-secondary/50 transition-all group flex flex-col items-center gap-3 active:scale-95"
            >
              <div className="bg-pink-50 p-4 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors text-secondary">
                <Users size={28} />
              </div>
              <span className="font-bold text-slate-700">Join Room</span>
            </button>
          </div>
        )}

        {/* Updated Operations Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 ml-1">Recent Operations</h3>
          {rooms && rooms.length > 0 ? (
             <div className="space-y-3">
               {rooms.map((room) => (
                 <RoomCard key={room._id} room={room} />
               ))}
             </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <p className="text-slate-400 text-sm">No recent secure channels found.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {showCreate && (
        <CreateRoomModal 
          room={newRoom} 
          isLoading={isCreating} 
          onClose={() => setShowCreate(false)} 
        />
      )}
      {showJoin && (
        <JoinRoomModal onClose={() => setShowJoin(false)} />
      )}
    </div>
  );
};

export default Dashboard;