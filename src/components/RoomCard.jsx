import React from 'react';
import { MessageSquare, Radio, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteRoom } from '../hooks/useDeleteRoom';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();
  
  // Using the status 'waiting' or 'active' from your backend logic
  const isJoined = room?.status === 'active';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isJoined ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">Room: {room?.code}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
             <Radio size={12} className={isJoined ? "text-emerald-500" : "text-amber-500 animate-pulse"} />
             <p className={`text-[10px] font-bold uppercase tracking-wider ${isJoined ? 'text-emerald-500' : 'text-amber-500'}`}>
               {isJoined ? 'Agent Connected' : 'Waiting for Agent...'}
             </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
         {/* STATUS BUTTON: Swaps styles based on connection */}
        <button 
          onClick={() => isJoined && navigate(`/chat/${room._id}`)}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            isJoined 
            ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          {isJoined ? 'Connect' : 'Waiting'}
          <ArrowRight size={16} />
        </button>
        {/* DELETE BUTTON: Only visible during 'waiting' status */}
        {!isJoined && (
          <button 
            onClick={() => deleteRoom(room._id)}
            disabled={isDeleting}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 disabled:opacity-50"
            title="Delete Room"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;