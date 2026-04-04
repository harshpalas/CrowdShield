import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
  const { user, updateUser } = useStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
    familyMembers: user?.familyMembers || [{ name: '', mobile: '' }],
  });

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...formData.familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const addFamilyMember = () => {
    if (formData.familyMembers.length < 3) {
      setFormData({ ...formData, familyMembers: [...formData.familyMembers, { name: '', mobile: '' }] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);

    try {
      const updateData: any = { ...formData };
      delete updateData.confirmPassword;
      if (!updateData.password) delete updateData.password;

      const { data } = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      updateUser(data);
      toast.success('Profile Matrix Updated');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl glass-card rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Profile Settings</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Identity Management Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X className="w-6 h-6 text-white/20" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black ml-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black ml-2">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black ml-2">Update Password</label>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="New Password (Leave empty to keep current)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-xs"
                />
              </div>
              <div className="relative group mt-2">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all text-xs"
                />
              </div>
            </div>
          </div>

          {user?.role === 'citizen' && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black ml-2">Family Network Contacts</label>
                {formData.familyMembers.length < 3 && (
                  <button type="button" onClick={addFamilyMember} className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
                    + Add Member
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {formData.familyMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white outline-none focus:bg-white/10 transition-all text-xs"
                    />
                    <input
                      placeholder="Mobile"
                      value={member.mobile}
                      onChange={(e) => handleFamilyMemberChange(index, 'mobile', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white outline-none focus:bg-white/10 transition-all text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/5 transition-all"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
