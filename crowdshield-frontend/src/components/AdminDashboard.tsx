import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Shield, User, Camera, Calendar, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { reports, user, updateReportStatus, setIsAdminMode } = useStore();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const campusCenter = { lat: 23.1777, lng: 80.0250 };

  const handleStatusUpdate = async (reportId: string, newStatus: 'pending' | 'investigating' | 'resolved' | 'dismissed') => {
    try {
      await axios.patch(`http://localhost:5000/api/reports/${reportId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user?.token}` }}
      );
      updateReportStatus(reportId, newStatus);
      toast.success(`INCIDENT SEALED: Sector cleared.`, {
        icon: '✅',
        style: { background: '#064e3b', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)' }
      });
      setSelectedReport(null);
    } catch (error) {
      toast.error('Command Link Failed: Could not update status');
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
                  report.status === 'resolved' 
                    ? 'bg-green-500/20 border-green-500/40 shadow-green-500/10' 
                    : 'bg-red-500/30 border-red-600 shadow-red-600/30 animate-pulse'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${report.status === 'resolved' ? 'bg-green-500' : 'bg-red-600 shadow-[0_0_15px_#ef4444]'}`} />
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
              className="absolute top-10 right-10 bottom-10 w-[420px] glass-card rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-[110]"
            >
               {/* Media Intel Banner */}
               <div className="h-72 bg-black/40 relative group overflow-hidden">
                  {selectedReport.imageUrl ? (
                    <img 
                      src={selectedReport.imageUrl} 
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
                     <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${selectedReport.status === 'resolved' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
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

               <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                        selectedReport.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                     }`}>
                        {selectedReport.status} incident
                     </span>
                     <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight pt-2">Intelligence Dossier</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <User className="w-4 h-4 text-blue-500 mb-3" />
                        <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Source Agent</label>
                        <p className="text-[10px] text-white font-mono truncate">{selectedReport.user}</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                        <Calendar className="w-4 h-4 text-purple-500 mb-3" />
                        <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Intercepted At</label>
                        <p className="text-[10px] text-white font-mono">{new Date(selectedReport.createdAt).toLocaleTimeString()}</p>
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

                  {selectedReport.status !== 'resolved' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusUpdate(selectedReport._id, 'resolved')}
                      className="w-full py-6 bg-white text-black rounded-[2rem] flex items-center justify-center gap-4 group shadow-2xl hover:bg-green-500 hover:text-white transition-all mt-auto"
                    >
                       <CheckCircle2 className="w-5 h-5" />
                       <span className="text-xs font-black uppercase tracking-[0.2em]">Seal Incident & Clear Paths</span>
                    </motion.button>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
