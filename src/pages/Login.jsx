import React, { useState } from 'react';
import { MessageSquare, Lock, Mail, Loader2, AlertCircle } from 'lucide-react'; 
import { useLogin } from '../hooks/useLogin'; // 1. Import the Hook

const Login = () => {
  // State for inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Initialize the Hook
  const { mutate: login, isPending, isError, error } = useLogin();

  // 3. Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Fire the API call
    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      
      {/* CARD CONTAINER */}
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* 1. IMAGE BACKGROUND LAYER */}
        <div className="absolute inset-0 md:relative md:w-2/5 bg-primary z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-50 md:opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 md:hidden"></div>

          {/* INNER CONTENT (Desktop Only) */}
          <div className="hidden md:flex relative z-10 flex-col justify-center items-center h-full text-white p-12 text-center">
            <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-md border border-white/30 shadow-lg">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight">VIP Access Only</h2>
            <p className="text-blue-50 text-sm leading-relaxed opacity-90">
              Restricted network. <br />Authorized personnel only. 
            </p>
          </div>
        </div>

        {/* 2. FORM LAYER */}
        <div className="relative z-10 w-full md:w-3/5 h-full flex flex-col justify-center p-8 md:p-12 bg-white/90 md:bg-white backdrop-blur-sm md:backdrop-blur-none transition-all">
          
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Agent</h1>
            <p className="text-gray-500 font-medium">Identify yourself to proceed.</p>
          </div>

          {/* ERROR ALERT */}
          {isError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-center gap-3 animate-pulse">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">
                {error?.response?.data?.message || "Authentication Failed"}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Identity (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="agent@secret.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Access Code</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20 flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;