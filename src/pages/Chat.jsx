import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Shield, ArrowLeft, MoreVertical, Wifi, WifiOff, Lock } from 'lucide-react';
import { socket } from '../socket'; // Import the singleton socket
import { 
  addMessage, 
  setSocketConnected, 
  setTypingStatus 
} from '../redux/slices/chatSlice';
import { useUser } from '../hooks/useUser';

const Chat = () => {
  const { id: roomId } = useParams(); // The Room ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: user } = useUser();
  
  // Redux State
  const { messages, isConnected, isTyping } = useSelector((state) => state.chat);
  
  // Local State
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // --- 1. SOCKET CONNECTION LOGIC ---
  useEffect(() => {
    if (!user) return;

    // A. Connect & Setup
    socket.connect();
    socket.emit("setup", user);
    socket.emit("join chat", roomId);

    // B. Event Listeners
    socket.on("connected", () => dispatch(setSocketConnected(true)));
    socket.on("message received", (msg) => dispatch(addMessage(msg)));
    socket.on("typing", () => dispatch(setTypingStatus(true)));
    socket.on("stop typing", () => dispatch(setTypingStatus(false)));

    // C. Cleanup on Unmount (Leave Room)
    return () => {
      socket.off("connected");
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
      socket.emit("leave chat", roomId);
      socket.disconnect(); // Cut the line when leaving page
    };
  }, [user, roomId, dispatch]);

  // --- 2. AUTO-SCROLL TO BOTTOM ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- 3. SEND MESSAGE HANDLER ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      sender: { _id: user._id, username: user.username },
      chat: roomId,
      createdAt: new Date().toISOString(),
    };

    // Emit to Server
    socket.emit("new message", messageData);
    socket.emit("stop typing", roomId);
    
    // Optimistic UI Update (Show immediately)
    dispatch(addMessage(messageData));
    setNewMessage("");
  };

  // --- 4. TYPING HANDLER ---
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isConnected) return;

    // Emit typing event (throttled logic can be added here)
    if (!isTyping) {
       socket.emit("typing", roomId);
    }

    // Stop typing after 3 seconds of inactivity
    let timerLength = 3000;
    let lastTypingTime = new Date().getTime();
    
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && isTyping) {
        socket.emit("stop typing", roomId);
      }
    }, timerLength);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* --- HEADER --- */}
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
                 {isConnected ? (
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                 ) : (
                   <span className="h-2 w-2 rounded-full bg-red-400"></span>
                 )}
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                   {isConnected ? 'Live & Encrypted' : 'Connecting...'}
                 </span>
               </div>
             </div>
          </div>
        </div>
        
        <button className="text-slate-400 p-2 hover:bg-slate-50 rounded-full">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* --- MESSAGES AREA --- */}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8FAFC]">
        <div className="flex justify-center my-4 opacity-50">
           <span className="text-[10px] font-mono bg-slate-200 text-slate-500 px-2 py-1 rounded">
             ENCRYPTION KEY: {roomId.slice(-6).toUpperCase()}
           </span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.sender._id === user?._id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div 
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm shadow-sm relative ${
                  isMe 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed font-medium">{msg.content}</p>
                <p className={`text-[9px] mt-1.5 text-right font-mono opacity-70`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Bubble */}
        {isTyping && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
        )}
        
        {/* Invisible div to auto-scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a secure message..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary-hover text-white p-3.5 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;