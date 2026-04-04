import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone, Building, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [entryMode, setEntryMode] = useState<'citizen' | 'org'>('citizen');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    organizationType: 'police station',
    city: '',
    familyMembers: [{ name: '', mobile: '' }],
  });

  const { setUser } = useStore();

  const accentHex = entryMode === 'org' ? '#ef4444' : '#3b82f6';

  const handleFamilyMemberChange = (index: number, field: 'name' | 'mobile', value: string) => {
    const newFamilyMembers = [...formData.familyMembers];
    newFamilyMembers[index][field] = value;
    setFormData({ ...formData, familyMembers: newFamilyMembers });
  };

  const addFamilyMember = () => {
    if (formData.familyMembers.length < 3) {
      setFormData({ ...formData, familyMembers: [...formData.familyMembers, { name: '', mobile: '' }] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      let payload: any = {
        role: entryMode,
        email: formData.email,
        password: formData.password,
      };

      if (!isLogin) {
        if (entryMode === 'citizen') {
          payload = {
            ...payload,
            fullName: formData.fullName,
            phone: formData.phone,
            familyMembers: formData.familyMembers.filter(mem => mem.name && mem.mobile),
          };
        } else {
          payload = {
            ...payload,
            organizationType: formData.organizationType,
            city: formData.city,
            phone: formData.phone,
          };
        }
      }
      
      // Get location if available
      let location = { type: 'Point', coordinates: [0, 0] };
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          type: 'Point',
          coordinates: [pos.coords.longitude, pos.coords.latitude],
        };
      } catch (err) {
        console.warn('Geolocation failed, using default', err);
      }

      const { data } = await axios.post(`http://localhost:5000${endpoint}`, { ...payload, location });
      
      setUser(data);
      toast.success(isLogin ? `Welcome back!` : 'Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#08080a] relative overflow-hidden page-transition">
      {/* Animated Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse transition-colors duration-700 ${entryMode === 'org' ? 'bg-red-900/10' : 'bg-blue-900/10'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-700 ${entryMode === 'org' ? 'bg-red-900/5' : 'bg-blue-900/5'}`}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-10 glass-card rounded-[2.5rem] relative z-10 mx-4 border border-white/5 shadow-2xl"
      >
        {/* Entry Protocol Switcher */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 border border-white/5">
            <button 
                onClick={() => setEntryMode('citizen')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'citizen' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/20 hover:text-white/40'}`}
            >
                Citizen
            </button>
            <button 
                onClick={() => setEntryMode('org')}
                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${entryMode === 'org' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/20 hover:text-white/40'}`}
            >
                Organization
            </button>
        </div>

        <div className="text-center mb-10">
          <div className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6 transition-all duration-700 ${entryMode === 'org' ? 'from-red-600 to-red-900 shadow-red-900/40' : 'from-blue-600 to-blue-900 shadow-blue-900/40'}`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">CROWDSHIELD</h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">
            {isLogin ? `Access your account` : `Create a new ${entryMode} account`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-5"
              >
                {entryMode === 'citizen' ? (
                  <>
                    <div className="relative group">
                      <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors group-focus-within:text-[${accentHex}]`} style={{ color: formData.fullName ? accentHex : '' }} />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
                        style={{ borderColor: formData.fullName ? `${accentHex}50` : '' }}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors group-focus-within:text-[${accentHex}]`} style={{ color: formData.phone ? accentHex : '' }} />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
                        style={{ borderColor: formData.phone ? `${accentHex}50` : '' }}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                        <h3 className="text-white/50 text-sm mb-2">Family Members (Optional, max 3)</h3>
                        {formData.familyMembers.map((member, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input type="text" placeholder="Name" value={member.name} onChange={e => handleFamilyMemberChange(index, 'name', e.target.value)} className="w-1/2 bg-white/5 border border-white/5 rounded-lg p-2 text-white placeholder:text-white/20" />
                                <input type="text" placeholder="Mobile" value={member.mobile} onChange={e => handleFamilyMemberChange(index, 'mobile', e.target.value)} className="w-1/2 bg-white/5 border border-white/5 rounded-lg p-2 text-white placeholder:text-white/20" />
                            </div>
                        ))}
                        {formData.familyMembers.length < 3 && (
                          <button 
                            type="button" 
                            onClick={addFamilyMember} 
                            className="text-[10px] uppercase tracking-widest font-black text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2 mt-2"
                          >
                            <Users className="w-3 h-3" />
                            Add Member
                          </button>
                        )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative group">
                      <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors group-focus-within:text-[${accentHex}]`} />
                      <select
                        required
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10 appearance-none`}
                        value={formData.organizationType}
                        onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      >
                        <option value="police station">Police Station</option>
                        <option value="NGO">NGO</option>
                        <option value="rescue team">Rescue Team</option>
                      </select>
                    </div>
                     <div className="relative group">
                      <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors group-focus-within:text-[${accentHex}]`} style={{ color: formData.city ? accentHex : '' }} />
                      <input
                        type="text"
                        required
                        placeholder="City"
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
                        style={{ borderColor: formData.city ? `${accentHex}50` : '' }}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors group-focus-within:text-[${accentHex}]`} style={{ color: formData.phone ? accentHex : '' }} />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
                        style={{ borderColor: formData.phone ? `${accentHex}50` : '' }}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors`} style={{ color: formData.email ? accentHex : '' }} />
            <input
              type="email"
              required
              placeholder="Email Address"
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
              style={{ borderColor: formData.email ? `${accentHex}50` : '' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 transition-colors`} style={{ color: formData.password ? accentHex : '' }} />
            <input
              type="password"
              required
              placeholder="Password"
              className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 transition-all outline-none focus:bg-white/10`}
              style={{ borderColor: formData.password ? `${accentHex}50` : '' }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all group disabled:opacity-50 hover:text-white`}
            style={{ backgroundColor: loading ? '' : 'white', color: 'black' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentHex; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = `0 10px 40px ${accentHex}30`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Login' : 'Sign Up'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/30 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-white font-bold transition-colors ml-1`}
            style={{ color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.color = accentHex}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
