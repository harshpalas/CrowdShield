import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { X, Camera, AlertTriangle, CheckCircle, Navigation, Target, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReportModal = () => {
  const { 
    user, 
    reportLocation, 
    setReportLocation, 
    setIsReporting, 
    addReport,
    destination,
    navigationTargetName,
    isSelectingDestination,
    setIsSelectingDestination,
    setIsNavigating
  } = useStore();
  const [type, setType] = useState<'normal' | 'dangerous'>('normal');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportLocation) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      toast.error('Brief description required');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('longitude', reportLocation.lng.toString());
    formData.append('latitude', reportLocation.lat.toString());
    formData.append('description', description);
    formData.append('type', type);
    if (image) formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/reports/create', formData, {
        headers: { 
          'Authorization': `Bearer ${user?.token}`
        }
      });

      toast.success(type === 'dangerous' ? 'CRITICAL ALERT EMITTED' : 'Crowd Data Logged', {
        icon: type === 'dangerous' ? '🚨' : '✅'
      });

      addReport(response.data);
      
      // If a destination was set, activate navigation
      if (destination) {
        setIsNavigating(true);
      }
      
      // Cleanup
      setReportLocation(null);
      setIsReporting(false);
      setIsSelectingDestination(false);
    } catch (error) {
      toast.error('Signal Interrupted: Check Connection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        backgroundColor: isSelectingDestination ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.8)',
        backdropFilter: isSelectingDestination ? 'blur(0px)' : 'blur(4px)'
      }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-500 ${isSelectingDestination ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <motion.div
        layout
        initial={{ scale: 0.9, y: 20 }}
        animate={{ 
          scale: isSelectingDestination ? 0.8 : 1, 
          x: isSelectingDestination ? '-35%' : '0%',
          y: 0,
          opacity: 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-lg glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative pointer-events-auto"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-transparent">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-white uppercase">Initialize Signal</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Sector-7 Intelligence Report</p>
          </div>
          <button onClick={() => setReportLocation(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X className="w-5 h-5 text-white/20 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('normal')}
                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                  type === 'normal' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'
                }`}
              >
                <CheckCircle className={`w-6 h-6 ${type === 'normal' ? 'text-green-500' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Normal Crowd</span>
              </button>
              <button
                type="button"
                onClick={() => setType('dangerous')}
                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                  type === 'dangerous' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-transparent border-white/5 text-white/20 hover:border-white/10'
                }`}
              >
                <AlertTriangle className={`w-6 h-6 ${type === 'dangerous' ? 'text-red-500' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Dangerous</span>
              </button>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Visual intel (Optional)</label>
               <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-10 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-white/5 group-hover:bg-white/10 transition-all overflow-hidden min-h-[160px]">
                    {preview ? (
                      <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : (
                      <Camera className="w-8 h-8 text-white/20 group-hover:scale-110 transition-all" />
                    )}
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest z-20">
                      {preview ? 'Change Uplink' : 'Capture Perspective'}
                    </span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Detailed Situation</label>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe crowd flux and behavior..."
                  className="w-full h-32 bg-white/5 rounded-3xl border border-white/5 p-6 text-white text-xs placeholder:text-white/10 focus:outline-none focus:border-red-500/30 transition-all resize-none font-medium leading-relaxed"
               />
            </div>

            <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/20 space-y-4">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-black">Mission Objective</label>
                  {destination && (
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/20">
                          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-tighter">Target Locked</span>
                      </div>
                  )}
               </div>
               
               <div className="flex items-center gap-4">
                  <button
                      type="button"
                      onClick={() => setIsSelectingDestination(!isSelectingDestination)}
                      className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${
                          isSelectingDestination ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                  >
                      <Target className={`w-4 h-4 ${isSelectingDestination ? 'animate-pulse' : ''}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                          {isSelectingDestination ? 'Awaiting Map Click...' : 'Pin Destination'}
                      </span>
                  </button>
               </div>

               {destination && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                     <MapPin className="w-4 h-4 text-blue-500" />
                     <div>
                        <p className="text-[10px] font-bold text-white uppercase">{navigationTargetName}</p>
                        <p className="text-[8px] text-white/20 uppercase font-bold">Auto-Safe Guidance Active</p>
                     </div>
                  </div>
               )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-8 border-t border-white/5 bg-black/20">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full p-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                isSubmitting ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-red-500 hover:text-white glow-shadow shadow-white/5'
              }`}
            >
              {isSubmitting ? <span className="animate-spin text-xl">⏳</span> : <Navigation className="w-4 h-4 fill-current" />}
              {isSubmitting ? 'ENCRYPTING UNLINK...' : 'EMIT SIGNAL'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReportModal;
