import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Lock, Mail, Loader2, Key, AlertCircle } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    adminSecret: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': formData.adminSecret 
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Invalid clearance code?');
      }

      navigate('/login'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      
      {/* CARD CONTAINER */}
      <div className="relative w-full max-w-4xl min-h-[600px] h-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* 1. IMAGE BACKGROUND LAYER */}
        <div className="absolute inset-0 md:relative md:w-2/5 bg-primary z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-50 md:opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 md:hidden"></div>

          {/* INNER CONTENT (Desktop Only) */}
          <div className="hidden md:flex relative z-10 flex-col justify-center items-center h-full text-white p-12 text-center">
            <div className="bg-white/20 p-4 rounded-full mb-6 backdrop-blur-md border border-white/30 shadow-lg">
              <Shield size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Agent Onboarding</h2>
            <p className="text-blue-50 text-sm leading-relaxed opacity-90">
              Establish your secure identity. <br />Clearance code required. 
            </p>
          </div>
        </div>

        {/* 2. FORM LAYER */}
        <div className="relative z-10 w-full md:w-3/5 h-full flex flex-col justify-center p-8 md:p-12 bg-white/90 md:bg-white backdrop-blur-sm md:backdrop-blur-none transition-all">
          
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Request Clearance</h1>
            <p className="text-gray-500 font-medium">Create your secure tunnel identity.</p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r flex items-center gap-3 animate-pulse">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Codename</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="e.g. Agent Phoenix"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Identity (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="agent@secret.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Encryption Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Admin Secret */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Clearance Code</label>
              <div className="relative">
                <Key className="absolute left-4 top-3.5 text-amber-500" size={20} />
                <input 
                  type="password" 
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-sm"
                  placeholder="Enter Admin Secret"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20 flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Initialize Agent'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm font-medium text-gray-500">
            Already have clearance?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover transition-colors">
              Authenticate Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;