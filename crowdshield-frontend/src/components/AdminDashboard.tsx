import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Shield, User, Camera, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { reports, user, setIsAdminMode, updateUser } = useStore();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const campusCenter = { lat: 23.1777, lng: 80.0250 };

  const handleUpdate = async (reportId: string, updates: { status?: string, is_verified?: boolean }) => {
    try {
      await axios.patch(`http://localhost:5000/api/reports/${reportId}/status`, 
        updates,
        { headers: { Authorization: `Bearer ${user?.token}` }}
      );
      
      if (updates.is_verified === true) toast.success('Report Verified: Citizen Rewarded');
      if (updates.is_verified === false) toast.error('Report Flagged: False alert logged');
      
      if (updates.status === 'monitoring') {
        toast.success('Tactical Response Initiated (+5 Coins)');
        updateUser({ coins: (user?.coins || 0) + 5 });
      }
      if (updates.status === 'cleared') {
        toast.success('Mission Accomplished: Sector Clear (+10 Coins)');
        updateUser({ coins: (user?.coins || 0) + 10 });
      }
      
      setSelectedReport(null);
    } catch (error) {
      toast.error('Command Link Failed: Could not update incident');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08080a] flex flex-col overflow-hidden">
      {/* Top Protocol Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass relative z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-white">COMMAND CENTER</h2>
            <div className="flex items-center gap-3">
               <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Authority Oversight Mode</span>
               <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end text-right">
              <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Active Alerts</span>
              <span className="text-xl font-black text-red-500 font-mono tracking-tighter">
                {reports.filter(r => r.status === 'pending').length}
              </span>
           </div>
           <div className="w-[1px] h-8 bg-white/5" />
           <button 
             onClick={() => { setIsAdminMode(false); }}
             className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-white/40 hover:text-white transition-all"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={campusCenter}
            defaultZoom={17}
            mapId="f1981881643c723b"
            disableDefaultUI={true}
            className="w-full h-full"
            styles={[{ featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'on' }] }]}
          >
            {reports.map((report) => (
              <AdvancedMarker
                key={report._id}
                position={{ lat: report.location.coordinates[1], lng: report.location.coordinates[0] }}
                onClick={() => setSelectedReport(report)}
              >
                <div className={`p-1.5 rounded-full border-4 shadow-2xl transform hover:scale-125 transition-all cursor-pointer ${
                  report.status === 'cleared' 
                    ? 'bg-green-500/20 border-green-500/40 shadow-green-500/10' 
                    : 'bg-red-500/30 border-red-600 shadow-red-600/30 animate-pulse'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${report.status === 'cleared' ? 'bg-green-500' : 'bg-red-600 shadow-[0_0_15px_#ef4444]'}`} />
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>

        {/* Intelligence Dossier Overlay */}
        <AnimatePresence mode="wait">
          {selectedReport && (
            <motion.div 
              initial={{ opacity: 0, x: 100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 200, scale: 0.95 }}
              className="absolute top-10 right-10 bottom-10 w-[440px] glass-card rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-[110]"
            >
               {/* Media Intel Banner */}
               <div className="h-64 bg-black/40 relative group overflow-hidden">
                  {selectedReport.image_url ? (
                    <img 
                      src={selectedReport.image_url} 
                      alt="Intelligence" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-white/5 to-transparent">
                       <Camera className="w-16 h-16 text-white/5" />
                       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">No Visual Intercept</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                  <div className="absolute top-8 left-8">
                     <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${selectedReport.status === 'cleared' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                        {selectedReport.status} incident
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="absolute top-8 right-8 p-3 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all hover:rotate-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">Intelligence Dossier</h3>
                       <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Incident ID: {selectedReport._id.slice(-6)}</p>
                    </div>
                    {selectedReport.is_verified !== null && (
                      <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${selectedReport.is_verified ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                        {selectedReport.is_verified ? 'Verified Authentic' : 'Flagged False'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <User className="w-4 h-4 text-blue-500 mb-3" />
                        <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Reporter ID</label>
                        <p className="text-[10px] text-white font-mono truncate">{selectedReport.user?.userId || selectedReport.ctz_id}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <Shield className="w-4 h-4 text-green-500 mb-3" />
                        <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Confidence Score</label>
                        <p className="text-[10px] text-white font-mono font-bold tracking-widest">
                          {selectedReport.user?.confidenceScore !== undefined ? `${selectedReport.user.confidenceScore.toFixed(1)}%` : '---'}
                        </p>
                     </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                     <div className="flex items-center justify-between">
                        <div>
                           <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Verification Indicator</label>
                           <p className="text-[10px] text-white font-bold uppercase tracking-wider">
                              {selectedReport.is_verified === null ? 'Pending Verification' : (selectedReport.is_verified ? 'Verified ✅' : 'False ❌')}
                           </p>
                        </div>
                        {selectedReport.is_verified !== null && (
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedReport.is_verified ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {selectedReport.is_verified ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                        <AlertCircle className="w-12 h-12 text-white" />
                     </div>
                     <label className="text-[8px] text-white/20 uppercase font-black block mb-2">Tactical Context</label>
                     <p className="text-xs text-white/70 leading-relaxed font-medium capitalize">
                        {selectedReport.description}
                     </p>
                  </div>

                  {/* Operational Controls */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    {selectedReport.is_verified === null && (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleUpdate(selectedReport._id, { is_verified: true })}
                          className="py-4 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-2xl border border-green-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Verify as Genuine
                        </button>
                        <button 
                          onClick={() => handleUpdate(selectedReport._id, { is_verified: false })}
                          className="py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Mark as False
                        </button>
                      </div>
                    )}

                    {selectedReport.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpdate(selectedReport._id, { status: 'monitoring' })}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-4 group shadow-xl hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                         <Shield className="w-4 h-4" />
                         Respond to Incident (+5 Coins)
                      </motion.button>
                    )}

                    {selectedReport.status === 'monitoring' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (selectedReport.org_id === (user?.userId || user?._id)) {
                             handleUpdate(selectedReport._id, { status: 'cleared' });
                          } else {
                             toast.error('Tactical Access Denied: Assignment Mismatch');
                          }
                        }}
                        className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 group shadow-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                          selectedReport.org_id === (user?.userId || user?._id) 
                            ? 'bg-white text-black hover:bg-green-500 hover:text-white' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        }`}
                      >
                         <CheckCircle2 className="w-4 h-4" />
                         {selectedReport.org_id === (user?.userId || user?._id) ? 'Mark as Cleared (+10 Coins)' : 'Assigned to Another Unit'}
                      </motion.button>
                    )}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
