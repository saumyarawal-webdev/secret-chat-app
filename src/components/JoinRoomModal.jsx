import React, { useState } from 'react';
import { X, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useJoinRoom } from '../hooks/useJoinRoom';

const JoinRoomModal = ({ onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const { mutate: joinRoom, isPending, isError, error } = useJoinRoom();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    // Sending the short code to the backend
    joinRoom(roomCode);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-[320px] rounded-[1.5rem] p-6 shadow-2xl animate-in zoom-in duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-secondary">
            <Key size={20} />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Join Tunnel</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <p className="text-[11px] text-slate-500 text-center leading-relaxed px-2">
            Enter the <span className="font-bold text-slate-700">Secret Key</span> to establish an encrypted link.
          </p>

          <div className="relative">
            <input 
              type="text" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="SECRET-KEY"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.2em] focus:outline-none focus:border-secondary transition-all placeholder:text-slate-300 placeholder:tracking-normal"
              autoFocus
              required
            />
            {isError && (
              <div className="mt-2 flex items-center justify-center gap-1 text-red-500 animate-bounce">
                <AlertCircle size={12} />
                <span className="text-[10px] font-bold">Invalid Key</span>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isPending || !roomCode}
            className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-secondary/20 active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Initialize
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;