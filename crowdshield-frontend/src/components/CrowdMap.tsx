import { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';
import { AlertTriangle, Crosshair, Users } from 'lucide-react';
import { calculateDistance } from '../utils/geoUtils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const HeatmapLayer = ({ data }: { data: any[] }) => {
  const map = useMap();
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || data.length === 0) {
       if (heatmapRef.current) heatmapRef.current.setMap(null);
       return;
    }

    const heatmapData = data.map((point) => ({
      location: new google.maps.LatLng(point.lat || point.location?.coordinates[1], point.lng || point.location?.coordinates[0]),
      weight: (point.density || 0.5) * 10,
    }));

    if (heatmapRef.current) {
        heatmapRef.current.setData(heatmapData);
    } else {
        heatmapRef.current = new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map: map,
          radius: 30,
        });
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [map, data]);

  return null;
};

const RecenterButton = ({ userLocation }: { userLocation: { lat: number, lng: number } | null }) => {
  const map = useMap();
  
  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(17);
      toast.success('Panned to Current Location', {
        icon: '🛰️',
        style: { background: '#0a0a0c', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.2)' }
      });
    } else {
        toast.error('Location Data Not Available Yet');
    }
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-32 right-10 z-40 p-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/20 rounded-2xl backdrop-blur-xl transition-all shadow-2xl group"
      title="Recenter on Me"
    >
      <Crosshair className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
};

const AnalysisPopup = ({ hotspot, onClose }: { hotspot: any; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 10 }}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] z-[60] w-72 glass-card p-6 rounded-[2rem] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] pointer-events-auto"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
        <Users className="w-6 h-6 text-red-500" />
      </div>
      <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all text-[10px] font-bold">CLOSE</button>
    </div>

    <div className="space-y-4">
      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold block mb-1">Total Persons</label>
        <p className="text-3xl font-black text-white leading-none">{hotspot.count} <span className="text-xs text-red-500 uppercase tracking-widest ml-2">Agents</span></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Risk Level</label>
          <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{hotspot.risk}</span>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <label className="text-[8px] text-white/20 uppercase font-black block mb-1">Status</label>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">CONGESTED</span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[9px] text-white/40 leading-relaxed italic">"Sector-7 cluster flux exceeding safety threshold. Immediate dispersal recommended."</p>
      </div>
    </div>
  </motion.div>
);

const CrowdMap = () => {
  const { heatmapData, reports, userLocation, hotspots } = useStore();
  const [activeHotspot, setActiveHotspot] = useState<any>(null);
  const [lastProximityAlert, setLastProximityAlert] = useState<number>(0);
  const campusCenter = { lat: 23.1777, lng: 80.0250 };

  useEffect(() => {
    if (userLocation && hotspots.length > 0) {
      hotspots.forEach(hotspot => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, hotspot.lat, hotspot.lng);
        if (distance < 50) {
          const now = Date.now();
          if (now - lastProximityAlert > 30000) {
            toast.error(
              "⚠️ DANGER ZONE DETECTED: You are under 50m from a high-risk area. Move away immediately and seek an alternative route.",
              {
                duration: 10000,
                icon: '🚨',
                style: {
                  background: '#7f1d1d',
                  color: '#fff',
                  border: '1px solid #ef4444'
                }
              }
            );
            setLastProximityAlert(now);
          }
        }
      });
    }
  }, [userLocation, hotspots, lastProximityAlert]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isInvalidKey = !apiKey || apiKey.includes('your_google_maps_api_key');

  return (
    <div className="w-full h-full min-h-[600px] relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0c] flex items-center justify-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-0 bg-[#08080a]">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">Initializing Surveillance Matrix</p>
      </div>

      <AnimatePresence>
        {activeHotspot && (
          <AnalysisPopup hotspot={activeHotspot} onClose={() => setActiveHotspot(null)} />
        )}
      </AnimatePresence>

      {isInvalidKey ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 text-center bg-[#08080a]/95 backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-2xl font-black mb-4 uppercase tracking-[0.2em] text-white">Authorization Required</h3>
          <p className="text-white/40 text-sm max-w-sm mb-10 leading-relaxed font-medium">
            Google Maps API Key is missing. Establish a secure link in <code className="text-red-500 bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/10 font-mono">crowdshield-frontend/.env</code>.
          </p>
        </div>
      ) : (
        <APIProvider apiKey={apiKey} libraries={['visualization']}>
          <Map
            defaultCenter={campusCenter}
            defaultZoom={16}
            colorScheme="DARK"
            disableDefaultUI={true}
            gestureHandling={'greedy'}
            id="surveillance-map"
            mapId="DEMO_MAP_ID"
            onClick={() => setActiveHotspot(null)}
          >
            <HeatmapLayer data={heatmapData} />
            <RecenterButton userLocation={userLocation} />
            
            {hotspots.map((h) => (
              <AdvancedMarker 
                key={h.id}
                position={{ lat: h.lat, lng: h.lng }}
                onClick={() => setActiveHotspot(h)}
              >
                <div className="relative w-16 h-16 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group">
                  {/* Outer Red Circle */}
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-red-500/10 group-hover:bg-red-500/20 transition-all animate-pulse" />
                  
                  {/* 5 Dots Inside (Dice pattern) */}
                  <div className="relative w-8 h-8">
                     <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
                     <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
                     <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
                     <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="user-location-dot" />
              </AdvancedMarker>
            )}

            {reports.map((report) => (
              <AdvancedMarker
                key={report._id}
                position={{
                  lat: report.location.coordinates[1],
                  lng: report.location.coordinates[0],
                }}
              >
                <Pin background={'#ef4444'} glyphColor={'#ffffff'} borderColor={'#000000'} />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      )}
    </div>
  );
};

export default CrowdMap;
