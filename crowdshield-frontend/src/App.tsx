import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import CrowdMap from './components/CrowdMap';
import Auth from './pages/Auth';
import { socketService } from './services/socketService';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, LogOut, User as UserIcon, Map as MapIcon, Play, Pause, Camera, Settings, Shield, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from './components/ReportModal';
import ProfileSettings from './components/ProfileSettings';
import { useGeolocation } from './hooks/useGeolocation';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
    active ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
  }`}>
    <Icon className={`w-5 h-5 ${active ? 'text-red-500' : ''}`} />
    <span className="font-medium tracking-wide">{label}</span>
  </button>
);

const SidePanel = () => {
  const { isSimulating, setIsSimulating, setUser, isReporting, setIsReporting, user, isNavigating, setIsNavigating } = useStore();
  const [showProfile, setShowProfile] = useState(false);

  const handleStartSimulation = async () => {
    try {
      await axios.get('http://localhost:5000/api/simulate/start');
      setIsSimulating(true);
      toast.success('Simulation Flux Online');
    } catch (error) {
      toast.error('Simulation Matrix Offline');
    }
  };

  const handleLogout = () => {
    setUser(null);
    toast.success('Agent Logged Out');
  };

  return (
    <div className="w-85 h-full flex flex-col gap-8 p-8 border-r border-white/5 glass-card relative z-50 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/30">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">CROWDSHIELD</h1>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Guardian Protocol v1.4</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarItem 
          icon={MapIcon} 
          label="Heat Map" 
          active={true} 
          onClick={() => {}} 
        />
        
        {user?.role === 'citizen' && (
          <>
            <SidebarItem 
              icon={Compass} 
              label="Safety Navigator" 
              active={isNavigating} 
              onClick={() => setIsNavigating(!isNavigating)} 
            />

            <SidebarItem 
              icon={Camera} 
              label={isReporting ? "Cancel SOS" : "Raise SOS"} 
              active={isReporting}
              onClick={() => setIsReporting(!isReporting)}
            />
            
            <SidebarItem 
              icon={Settings} 
              label="Profile Settings" 
              onClick={() => setShowProfile(true)} 
            />
          </>
        )}
      </nav>

      <AnimatePresence>
        {showProfile && user?.role === 'citizen' && (
          <ProfileSettings onClose={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      <div className="pt-6 border-t border-white/5 mt-auto">
        {user?.role === 'citizen' && (
          <>
            <label className="text-[10px] text-white/20 mb-4 block uppercase tracking-[0.3em] font-bold">Simulate Flux</label>
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl font-bold text-sm tracking-wide transition-all ${
                isSimulating ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed border border-red-500/10' : 'glow-button text-white'
              }`}
            >
              {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}
            </button>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-white/5">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group">
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-widest">Logout Agent</span>
           </button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = useStore();
  return (
    <header className="p-8 flex justify-between items-center relative z-40 bg-gradient-to-b from-[#08080a] to-transparent">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-1 text-white uppercase">Crowd Analytics</h2>
        <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Monitoring 1,024 live nodes in Sector-7 · Jabalpur</p>
      </div>
      
      <div className="flex gap-6 items-center">
         <div className="flex items-center gap-3 glass p-2 pr-6 rounded-2xl border border-white/5">
           <div className="w-10 h-10 rounded-xl border border-white/10 bg-gradient-to-br from-gray-800 to-black overflow-hidden flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-red-500" />
           </div>
           <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">{user?.fullName || 'Guest Agent'}</p>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Lvl 4 {user?.role === 'org' ? 'Admin' : 'Citizen'}</p>
           </div>
         </div>
         
         <div className="w-[1px] h-8 bg-white/5"></div>
         
         <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 relative group">
            <Bell className="w-5 h-5 text-white/60 group-hover:text-red-500 transition-colors" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#08080a] status-pulse"></span>
         </button>
         
         <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-2xl shadow-white/5"
         >
           Command Center
         </motion.button>
      </div>
    </header>
  );
}

const App = () => {
  const { user, fetchReports, setIsAdminMode } = useStore();
  useGeolocation();

  useEffect(() => {
    if (user) {
      fetchReports();
      if (user.role === 'org') {
        setIsAdminMode(true);
      }
      
      const socket = socketService.connect();
      
      socket.on('newReport', (report) => {
        if (report.type === 'dangerous') {
          toast.error(`CRITICAL: Dangerous Crowd Reported at [${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}]`, {
            duration: 8000,
            icon: '🚨',
            style: { border: '1px solid #ef4444', background: '#7f1d1d', color: '#fff' }
          });
        } else {
          toast.success('New Crowd Report Logged', { icon: '📊' });
        }
      });
    }
    return () => socketService.disconnect();
  }, [user]);

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#08080a] text-white overflow-hidden page-transition selection:bg-red-500/30 font-sans">
      <SidePanel />
      <AnimatePresence>
        <ReportModal />
      </AnimatePresence>

      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0a0a0c',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
              padding: '16px 24px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }
          }}
        />
        
        <Header />

        <div className="flex-1 w-full bg-red-900/5 relative overflow-hidden flex flex-col">
          <CrowdMap />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-10 left-10 z-30 flex items-center gap-8 p-8 glass rounded-[2.5rem] border border-white/5 shadow-3xl">
             <div className="flex flex-col gap-2 items-center group">
                <div className="w-12 h-1.5 bg-red-500 rounded-full shadow-[0_0_20px_#ef4444] group-hover:scale-110 transition-transform"></div>
                <span className="text-[10px] text-white/40 uppercase font-black mt-1">Danger Zone</span>
             </div>
             <div className="flex flex-col gap-2 items-center group">
                <div className="w-12 h-1.5 bg-yellow-500 rounded-full group-hover:scale-110 transition-transform"></div>
                <span className="text-[10px] text-white/40 uppercase font-black mt-1">High Dense</span>
             </div>
             <div className="flex flex-col gap-2 items-center group">
                <div className="w-12 h-1.5 bg-green-500/40 rounded-full group-hover:scale-110 transition-transform"></div>
                <span className="text-[10px] text-white/40 uppercase font-black mt-1">Optimized</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
