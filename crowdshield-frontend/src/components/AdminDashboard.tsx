import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { reports, user, updateReportStatus } = useStore();
  
  // Filter for dangerous reports only for the admin incident list
  const dangerousReports = reports.filter(r => r.type === 'dangerous' && r.status !== 'resolved' && r.status !== 'dismissed');

  const handleStatusUpdate = async (reportId: string, newStatus: 'pending' | 'investigating' | 'resolved' | 'dismissed') => {
    try {
      await axios.patch(`http://localhost:5000/api/reports/${reportId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user?.token}` }}
      );
      updateReportStatus(reportId, newStatus);
      toast.success(`Incident status updated to ${newStatus.toUpperCase()}`, {
        icon: newStatus === 'resolved' ? '✅' : '🚫',
        style: { background: '#0a0a0c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } catch (error) {
      toast.error('Tactical Link Failed: Could not update status');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">Active Critical Alerts</label>
        <div className="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
          <span className="text-[10px] font-black text-red-500 font-mono tracking-tighter">{dangerousReports.length} Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {dangerousReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white/5 mx-auto mb-4" />
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-black">Sector Clear: No Active Threats</p>
            </motion.div>
          ) : (
            dangerousReports.map((report) => (
              <motion.div
                key={report._id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="glass-card rounded-[2rem] border border-red-500/10 overflow-hidden relative group"
              >
                {/* Media Preview if exists */}
                {report.imageUrl && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <img 
                      src={report.imageUrl} 
                      alt="Intelligence" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                       <Eye className="w-3 h-3 text-white/70" />
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-[9px] text-white/20 font-mono uppercase tracking-tighter">{new Date(report.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {report.description}
                  </p>

                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleStatusUpdate(report._id, 'resolved')}
                      className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl border border-green-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                      className="p-3 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl border border-white/5 transition-all"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
