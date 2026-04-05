import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Target, Shield, X, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { SAFE_HAVENS } from '../constants/safeHavens';
import { calculateDistance } from '../utils/geoUtils';
import toast from 'react-hot-toast';

const NavigationPanel = () => {
  const { 
    userLocation, 
    destination, 
    setDestination, 
    navigationTargetName, 
    setNavigationTargetName, 
    isNavigating, 
    setIsNavigating,
    setSafeRoute,
    isPathCompromised,
    setPathCompromised,
    navigationAlert,
    availableRoutes
  } = useStore();

  const safestRoute = availableRoutes.length > 0 ? availableRoutes[0] : null;
  const safetyPercentage = safestRoute ? Math.max(0, 100 - (safestRoute.dangerScore * 10)) : 100;

  if (!isNavigating) return null;

  const handleSetSafeHaven = (haven: typeof SAFE_HAVENS[0]) => {
    setDestination({ lat: haven.lat, lng: haven.lng });
    setNavigationTargetName(haven.name);
    toast.success(`Guardian Route Locked: ${haven.name}`, { icon: '🛡️' });
  };

  const getNearestHaven = () => {
    if (!userLocation) return null;
    return SAFE_HAVENS.reduce((prev, curr) => {
      const prevDist = calculateDistance(userLocation.lat, userLocation.lng, prev.lat, prev.lng);
      const currDist = calculateDistance(userLocation.lat, userLocation.lng, curr.lat, curr.lng);
      return prevDist < currDist ? prev : curr;
    });
  };

  const nearest = getNearestHaven();

  const totalDistanceMeters = safestRoute?.route?.legs?.reduce((acc: number, leg: any) => acc + (leg.distance?.value || 0), 0);
  const totalDurationSeconds = safestRoute?.route?.legs?.reduce((acc: number, leg: any) => acc + (leg.duration?.value || 0), 0);
  
  const formattedDistance = totalDistanceMeters ? (totalDistanceMeters / 1000).toFixed(1) + ' km' : '---';
  const formattedDuration = totalDurationSeconds ? Math.ceil(totalDurationSeconds / 60) + ' mins' : '-- min';

  return (
    <motion.div
      drag
      dragConstraints={{ left: -1000, right: 0, top: 0, bottom: 800 }}
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute top-24 right-8 z-50 w-72 flex flex-col gap-4 cursor-grab active:cursor-grabbing"
    >
      <div className="glass-card rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col backdrop-blur-3xl bg-black/40">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
                Safe Navigator
              </h3>
              <p className="text-[7px] text-white/20 font-bold uppercase tracking-tighter">
                Guardian Protocol Active
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsNavigating(false)} 
            className="p-1.5 hover:bg-white/5 rounded-full transition-all"
          >
            <X className="w-3.5 h-3.5 text-white/20" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!destination ? (
            <div className="space-y-4">
               <button 
                onClick={() => nearest && handleSetSafeHaven(nearest)}
                className="w-full p-5 bg-blue-600 text-white rounded-2xl flex items-center justify-between group hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
               >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 fill-current animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nearest Safe Point</span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>

               <div className="space-y-3">
                  <label className="text-[8px] text-white/20 uppercase font-black block tracking-widest">Strategic Havens</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {SAFE_HAVENS.map(haven => (
                      <button
                        key={haven.id}
                        onClick={() => handleSetSafeHaven(haven)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between group transition-all"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[9px] font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">{haven.name}</span>
                          <span className="text-[7px] text-white/20 uppercase font-bold">Safe Zone Locked</span>
                        </div>
                        <MapPin className="w-3.5 h-3.5 text-white/10 group-hover:text-blue-500 transition-all" />
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
               <div className={`p-5 border rounded-2xl relative overflow-hidden transition-all ${isPathCompromised ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                     {isPathCompromised ? <AlertCircle className="w-10 h-10 text-red-500" /> : <Target className="w-10 h-10 text-blue-500" />}
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <label className={`text-[8px] uppercase font-black block tracking-widest ${isPathCompromised ? 'text-red-500' : 'text-blue-400'}`}>
                        {isPathCompromised ? 'Path Breach Detected' : 'Guardian Path Locked'}
                    </label>
                    <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase flex items-center gap-1 ${safetyPercentage > 80 ? 'bg-green-500/20 text-green-400 border border-green-500/10' : 'bg-red-500/20 text-red-400 border border-red-500/10'}`}>
                      {safestRoute?.firstBreachCoord && safetyPercentage > 0 && <span className="w-1 h-1 bg-current rounded-full animate-ping" />}
                      {safetyPercentage}% Safe
                    </div>
                  </div>

                  <p className="text-[11px] font-black text-white uppercase tracking-tight truncate mb-4">{navigationTargetName}</p>
                  
                  <div className="flex items-center gap-6">
                     <div>
                        <span className="text-[7px] text-white/30 uppercase block font-bold mb-0.5">Range</span>
                        <span className="text-[10px] font-mono text-white font-bold tracking-tight">
                            {formattedDistance}
                        </span>
                     </div>
                     <div className="w-[1px] h-6 bg-white/10" />
                     <div>
                        <span className="text-[7px] text-white/30 uppercase block font-bold mb-0.5">ETA</span>
                        <span className="text-[10px] font-mono text-white font-bold tracking-tight">
                            {formattedDuration}
                        </span>
                     </div>
                  </div>
               </div>

               {isPathCompromised && (
                 <div className="p-4 bg-red-600/90 rounded-2xl border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Critical Alert</span>
                    </div>
                    <p className="text-[9px] text-white/90 font-bold leading-relaxed tracking-tight">
                        {navigationAlert || "UNSAFE SECTOR DETECTED. RETREAT TO PREVIOUS POSITION."}
                    </p>
                 </div>
               )}

               <button 
                 onClick={() => {
                     setDestination(null);
                     setNavigationTargetName(null);
                     setSafeRoute(null);
                     setPathCompromised(false);
                 }}
                 className="w-full p-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95"
               >
                 Terminate Path
               </button>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
         {destination && (
            <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.8, opacity: 0 }}
               className={`p-4 border rounded-3xl flex items-center gap-4 backdrop-blur-md ${isPathCompromised ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}
            >
               <div className={`p-2 rounded-xl animate-pulse ${isPathCompromised ? 'bg-red-500' : 'bg-blue-500'}`}>
                  <AlertCircle className="w-4 h-4 text-white" />
               </div>
               <div>
                  <p className={`text-[9px] font-black uppercase ${isPathCompromised ? 'text-red-500' : 'text-blue-400'}`}>
                    {isPathCompromised ? 'Tactical Warning' : 'Proactive Alert'}
                  </p>
                  <p className="text-[10px] text-white/70 font-medium whitespace-nowrap">
                    {isPathCompromised ? 'Danger detected on current path.' : 'Safe path active. No danger intercepts.'}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NavigationPanel;
