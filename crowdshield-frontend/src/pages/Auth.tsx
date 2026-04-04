import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { setUser } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      setUser(data);
      toast.success(isLogin ? 'Welcome back, Agent' : 'Identity Verified. Access Granted.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08080a] relative overflow-hidden page-transition">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-10 glass-card rounded-[2.5rem] relative z-10 mx-4 border border-white/5 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40 mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">CROWDSHIELD</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">
            {isLogin ? 'Mission Authorization Required' : 'Establish New Guardian Profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input
              type="email"
              required
              placeholder="Operational Email"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input
              type="password"
              required
              placeholder="Security Key"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-red-500/50 focus:bg-white/10 transition-all outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'AUTHORIZE ACCESS' : 'CREATE PROTOCOL'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/30 font-medium">
          {isLogin ? "No active profile?" : "Already established?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:text-red-500 font-bold transition-colors ml-1"
          >
            {isLogin ? 'Create Identity' : 'Authorize Identity'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
