import React, { useState } from 'react';
import { Copy, Check, X, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

const CreateRoomModal = ({ room, isLoading, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Tightened width to max-w-xs and reduced padding to p-6 */}
      <div className="bg-white w-full max-w-[320px] rounded-[1.5rem] p-6 shadow-2xl animate-in zoom-in duration-200 border border-slate-100">
        
        {/* Header - Reduced bottom margin */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={20} />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Secure Code</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={18}/>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-slate-500 text-sm font-medium italic">Encrypting...</p>
          </div>
        ) : room?.code ? (
          <div className="space-y-4">
            {/* Compact Code Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center gap-3">
              <span className="text-3xl font-mono font-bold tracking-[0.2em] text-primary">
                {room.code}
              </span>
              
              <button 
                onClick={copyToClipboard}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-black text-white'
                }`}
              >
                {copied ? <Check size={16}/> : <Copy size={16}/>}
                {copied ? 'Copied!' : 'Copy Key'}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium leading-tight">
              Share this key to establish a secure P2P tunnel.
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-red-500">
            <AlertTriangle className="mx-auto mb-2" size={24} />
            <p className="text-sm font-bold">Failed</p>
            <p className="text-[10px] opacity-70">Check backend logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomModal;