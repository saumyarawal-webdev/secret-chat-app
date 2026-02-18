import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Shield, Lock, UserCheck, UserX, Check, CheckCheck, Power, Loader2, AlertTriangle } from 'lucide-react';
import { socket } from '../socket'; 
import { 
  addMessage, 
  markMessageAsRead, 
  setSocketConnected, 
  setTypingStatus,
  resetChat
} from '../redux/slices/chatSlice';
import { useUser } from '../hooks/useUser';
import { useDeleteRoom } from '../hooks/useDeleteRoom';

const Chat = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user } = useUser();
  
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();
  const { messages, isTyping } = useSelector((state) => state.chat);
  
  const [newMessage, setNewMessage] = useState("");
  const [partnerStatus, setPartnerStatus] = useState("waiting");
  const messagesEndRef = useRef(null);

  // --- 1. SOCKET LOGIC ---
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    // ✅ NEW WAY (Shows ID Card)
if (user && user._id) {
  // We send an object with BOTH the Room ID and the User ID
  socket.emit("join_room", { roomCode: roomId, userId: user._id });
}
    dispatch(setSocketConnected(true));

    const handleAuthError = (data) => {
      console.error("Authentication Error:", data.message);
      alert(`⛔ ${data.message}`); // Show alert to explain why
      navigate('/'); // 🚪 KICK THEM OUT -> Redirect to Dashboard
    };
    // --- EVENT HANDLERS ---

    const handleReceiveMessage = (data) => {
      // 🟢 1. SILENT HANDSHAKE (Partner is here)
      if (data.type === 'STATUS_CHECK') {
        setPartnerStatus("joined");
        return; 
      }

      // 🔴 2. GOODBYE PROTOCOL (Partner killed the room)
      if (data.type === 'EXIT_SIGNAL') {
        console.log("⚠️ Partner terminated the session.");
        performCleanup(); // Auto-redirect immediately!
        return;
      }

      // 🔵 3. NORMAL MESSAGE
      dispatch(addMessage(data));
      if (data.id) {
        socket.emit("mark_read", { room: roomId, messageId: data.id });
      }
    };

    const handleMessageRead = (messageId) => {
      dispatch(markMessageAsRead(messageId));
    };

    const handleUserJoined = () => {
      setPartnerStatus("joined");
      const handshake = { room: roomId, type: 'STATUS_CHECK', sender: { _id: user._id }, content: "" };
      socket.emit("send_message", handshake);
    };

    const handleUserLeft = () => setPartnerStatus("waiting");
    const handleDisplayTyping = () => dispatch(setTypingStatus(true));
    const handleHideTyping = () => dispatch(setTypingStatus(false));
    
    socket.on("auth_error", handleAuthError);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_read", handleMessageRead);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("display_typing", handleDisplayTyping);
    socket.on("hide_typing", handleHideTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("display_typing", handleDisplayTyping);
      socket.off("hide_typing", handleHideTyping);
    };
  }, [user, roomId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- HELPER: CLEANUP & EXIT ---
  const performCleanup = () => {
    dispatch(resetChat());
    socket.emit("stop_typing", roomId);
    socket.disconnect(); 
    // ⚡️ FORCE HARD RELOAD to prevent White Screen on Dashboard
    window.location.href = '/';
  };

  // --- 3. DISCONNECT HANDLER (The Kill Switch) ---
  const handleDisconnect = () => {
    // 1. Send the "Goodbye" Signal to partner FIRST
    const exitSignal = { 
      room: roomId, 
      type: 'EXIT_SIGNAL', 
      sender: { _id: user._id },
      content: "Session Terminated" 
    };
    socket.emit("send_message", exitSignal);

    // 2. Delete from DB
    deleteRoom(roomId, {
      onSuccess: () => {
        performCleanup();
      },
      onError: (error) => {
        // Log error but force exit anyway so user isn't stuck
        if (error?.response?.status === 404) {
          console.warn("Room already deleted. Exiting...");
        } else {
          console.error("Failed to disconnect properly:", error.message);
        }
        performCleanup();
      }
    });
  };

  // --- 4. SEND MESSAGE ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = Date.now().toString(); 
    const messageData = {
      id: tempId,
      room: roomId,
      content: newMessage,
      sender: { _id: user._id, username: user.username },
      time: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: 'text',
      read: false 
    };

    socket.emit("send_message", messageData, (response) => {
      if (response?.status === 'ok') console.log("Server Ack ✅");
    });

    socket.emit("stop_typing", roomId);
    dispatch(addMessage(messageData));
    setNewMessage("");
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", roomId);
    setTimeout(() => socket.emit("stop_typing", roomId), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* HEADER: No Alert, Just Action */}
      <div className="bg-red-50/50 px-4 py-3 shadow-sm border-b border-red-100 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl text-red-500 shadow-sm border border-red-100">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              Secure Tunnel <Lock size={12} className="text-slate-400"/>
            </h2>
            <div className="flex items-center gap-1.5">
              {partnerStatus === 'joined' ? (
                <>
                  <UserCheck size={12} className="text-emerald-500"/>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Target Active</span>
                </>
              ) : (
                <>
                  <UserX size={12} className="text-amber-500"/>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Waiting for Target...</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleDisconnect}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Power size={16} />}
          <span>Disconnect</span>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8FAFC]">
        <div className="flex justify-center my-4 opacity-50">
           <span className="text-[10px] font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded">
             ENCRYPTION KEY: {roomId}
           </span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user?._id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm shadow-sm relative ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                <p className="leading-relaxed font-medium">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1.5 opacity-70`}>
                  <span className="text-[9px] font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (msg.read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} className="text-white/60" />)}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full delay-100"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full delay-200"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleTyping}
            placeholder={partnerStatus === 'joined' ? "Type a secure message..." : "Waiting..."}
            className="flex-1 bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-400"
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-primary hover:bg-primary-hover text-white p-3.5 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;