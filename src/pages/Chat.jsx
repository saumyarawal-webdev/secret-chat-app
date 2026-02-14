import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Shield, ArrowLeft, MoreVertical, Lock, UserCheck, UserX, Check, CheckCheck } from 'lucide-react';
import { socket } from '../socket'; 
import { 
  addMessage, 
  markMessageAsRead, // Import the new action
  setSocketConnected, 
  setTypingStatus 
} from '../redux/slices/chatSlice';
import { useUser } from '../hooks/useUser';

const Chat = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user } = useUser();
  
  const { messages, isTyping } = useSelector((state) => state.chat);
  const [newMessage, setNewMessage] = useState("");
  const [partnerStatus, setPartnerStatus] = useState("waiting");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join Room
    socket.emit("join_room", roomId); 
    dispatch(setSocketConnected(true));

    // --- EVENT HANDLERS ---

    // 1. Receive Message & Handshake
    const handleReceiveMessage = (data) => {
      // A. Handshake Logic (Invisible)
      if (data.type === 'STATUS_CHECK') {
        console.log("🐕 Handshake received! Partner is here.");
        setPartnerStatus("joined");
        return; 
      }

      // B. Normal Message Logic
      dispatch(addMessage(data));

      // C. Send Read Receipt (Blue Ticks Logic) 🔵
      // Tell backend: "I read this message"
      if (data.id) {
        socket.emit("mark_read", { room: roomId, messageId: data.id });
      }
    };

    // 2. Message Read (Update my UI to show Blue Ticks)
    const handleMessageRead = (messageId) => {
      console.log("🔵 My message was read:", messageId);
      dispatch(markMessageAsRead(messageId));
    };

    // 3. User Presence
    const handleUserJoined = () => {
      setPartnerStatus("joined");
      // Send Handshake back
      const handshake = {
        room: roomId,
        type: 'STATUS_CHECK',
        sender: { _id: user._id },
        content: ""
      };
      socket.emit("send_message", handshake);
    };

    const handleUserLeft = () => setPartnerStatus("waiting");
    const handleDisplayTyping = () => dispatch(setTypingStatus(true));
    const handleHideTyping = () => dispatch(setTypingStatus(false));

    // Attach Listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_read", handleMessageRead); // Listen for blue ticks
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Generate a temporary ID so we can track it for Read Receipts
    const tempId = Date.now().toString(); 

    const messageData = {
      id: tempId, // Added ID for tracking
      room: roomId,
      content: newMessage,
      sender: { _id: user._id, username: user.username },
      time: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: 'text',
      read: false // Default to unread
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
      
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
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
                     <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Agent Active</span>
                   </>
                 ) : (
                   <>
                     <UserX size={12} className="text-amber-500"/>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Waiting for Agent...</span>
                   </>
                 )}
               </div>
             </div>
          </div>
        </div>
        <button className="text-slate-400 p-2 hover:bg-slate-50 rounded-full"><MoreVertical size={20}/></button>
      </div>

      {/* Messages */}
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
                  <span className="text-[9px] font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {/* --- BLUE TICKS LOGIC --- */}
                  {isMe && (
                    msg.read 
                      ? <CheckCheck size={14} className="text-blue-200" /> // Blue Ticks (on blue bg, use light blue)
                      : <Check size={14} className="text-white/60" /> // Grey Tick
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleTyping}
            placeholder={partnerStatus === 'joined' ? "Type a secure message..." : "Waiting for partner..."}
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