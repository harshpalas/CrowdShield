import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import CrowdMap from './components/CrowdMap';
import Auth from './pages/Auth';
import { socketService } from './services/socketService';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LogOut, User as UserIcon, Map as MapIcon, Camera, Settings, Shield, Compass, Menu, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from './components/ReportModal';
import ProfileSettings from './components/ProfileSettings';
import AdminDashboard from './components/AdminDashboard';
import { useGeolocation } from './hooks/useGeolocation';

const SidebarItem = ({ icon: Icon, label, active = false, onClick, variant = 'default', className = '' }: { icon: any, label: string, active?: boolean, onClick?: () => void, variant?: 'default' | 'danger', className?: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group relative ${
    active 
      ? variant === 'danger' 
        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
        : 'bg-white/10 text-white shadow-inner border border-white/10' 
      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
  } ${variant === 'danger' && !active ? 'border border-red-500/20 text-red-500/70 hover:bg-red-500/10' : ''} ${className}`}>
    <Icon className={`w-5 h-5 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
    <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{label}</span>
    {active && variant !== 'danger' && (
      <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full" />
    )}
  </button>
);

const SidePanel = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const { setUser, user, activeTab, setActiveTab } = useStore();

  const handleLogout = () => {
    setUser(null);
    toast.success('Agent Logged Out');
  };

  const getBadge = (coins: number) => {
    if (coins <= 100) return 'Bronze Guardian';
    if (coins <= 500) return 'Silver Sentinel';
    if (coins <= 1000) return 'Gold Protector';
    return 'Elite Shield';
  };

  const coins = user?.coins || 0;
  const badge = getBadge(coins);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggle} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed lg:relative inset-y-0 left-0 w-[300px] h-full flex flex-col bg-[#08080a] border-r border-white/5 z-[70] transition-all duration-700 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Top Branding */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4 mb-12 cursor-pointer" onClick={() => setActiveTab('heatmap')}>
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">CROWDSHIELD</h1>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold">Guardian Protocol v1.4</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-6 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={MapIcon} label="Heat Map" 
            active={activeTab === 'heatmap'} 
            onClick={() => { setActiveTab('heatmap'); toggle(); }} 
          />
          
          <SidebarItem 
            icon={Camera} label="Raise SOS" 
            active={activeTab === 'sos'} variant="danger"
            className={activeTab === 'sos' ? 'sos-outline-pulse' : 'border border-red-500/20 text-red-500/50'}
            onClick={() => { setActiveTab('sos'); toggle(); }}
          />

          <SidebarItem 
            icon={Compass} label="Safety Navigation" 
            active={activeTab === 'navigator'} 
            onClick={() => { setActiveTab('navigator'); toggle(); }} 
          />

          <SidebarItem 
            icon={LayoutDashboard} label="Crowded Areas" 
            active={activeTab === 'delhi'}
            onClick={() => { setActiveTab('delhi'); toggle(); }} 
          />
        </nav>

        {/* Citizen Profile Section (Bottom-Anchored) */}
        <div className="mt-auto">
          <div className="px-6 pb-6">
            <div className="glass-card p-5 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 relative overflow-hidden">
                  <UserIcon className="w-6 h-6 text-red-500" />
                  <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate">
                      {user?.fullName || 'Ravikumar Gunti'}
                    </p>
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-all" onClick={() => setActiveTab('profile')}>
                      <Settings className="w-3.5 h-3.5 text-white/20 hover:text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Active Citizen</p>
                  </div>
                </div>
              </div>

              {/* Gamification Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[8px] text-white/60 uppercase font-black tracking-widest mb-1.5">Badge Status</span>
                  <span className="text-[11px] font-black text-red-500 uppercase tracking-tighter opacity-100">{badge}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-white/60 uppercase font-black tracking-widest mb-1.5">Coin Balance</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#ca8a04]">
                      <span className="text-[7px] text-black font-black">C</span>
                    </div>
                    <span className="text-[12px] font-black text-white opacity-100">{coins}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Integration */}
          <div className="px-6 pb-8 border-t border-white/5 bg-black/40">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all group rounded-2xl mt-4">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-[9px] uppercase tracking-[0.3em]">Logout Protocol</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const { user, fetchReports, setIsAdminMode, isAdminMode, activeTab } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useGeolocation();

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      fetchReports();
      if (user.role === 'org') {
        setIsAdminMode(true);
      }
      const socket = socketService.connect();
      socket.on('newReport', (report) => {
        if (report.type === 'dangerous') {
          toast.error(`ALERT: High Density Breach at Sector-7`, {
            style: { border: '1px solid #ef4444', background: '#0a0a0c', color: '#fff' }
          });
        }
      });
      return () => socketService.disconnect();
    }
  }, [user]);

  if (!user) return <><Toaster position="top-right" /><Auth /></>;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans p-3 lg:p-5 dashboard-frame">
      <div className="flex w-full h-full glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <SidePanel isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <AnimatePresence>
          <ReportModal />
          {activeTab === 'profile' && user.role === 'citizen' && <ProfileSettings onClose={() => useStore.getState().setActiveTab('heatmap')} />}
          {isAdminMode && <AdminDashboard />}
        </AnimatePresence>

        <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[#0a0a0c]">
          <Toaster position="top-right" />
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden absolute top-6 left-6 z-50 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white shadow-2xl active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 w-full relative overflow-hidden flex flex-col">
            <CrowdMap />
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-10 lg:translate-x-0 z-30 flex items-center gap-4 lg:gap-10 p-6 lg:p-10 glass-card rounded-[2.5rem] border border-white/10 shadow-3xl">
               <div className="flex flex-col gap-3 items-center group">
                  <div className="w-12 h-1.5 bg-red-600 rounded-full shadow-[0_0_20px_#ef4444] animate-pulse"></div>
                  <span className="text-[8px] lg:text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">Critical</span>
               </div>
               <div className="flex flex-col gap-3 items-center group">
                  <div className="w-12 h-1.5 bg-yellow-600 rounded-full shadow-[0_0_20px_#ca8a04]/20"></div>
                  <span className="text-[8px] lg:text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">Congested</span>
               </div>
               <div className="flex flex-col gap-3 items-center group">
                  <div className="w-12 h-1.5 bg-green-600/40 rounded-full"></div>
                  <span className="text-[8px] lg:text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">Clear</span>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
