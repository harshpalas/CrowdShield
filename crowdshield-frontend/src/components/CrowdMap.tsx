import { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';
import { AlertTriangle, Crosshair, Target, RefreshCw } from 'lucide-react';
import { calculateDistance, calculateOffsetPoint } from '../utils/geoUtils';
import NavigationPanel from './NavigationPanel';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';


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

const RefreshButton = ({ onRefresh }: { onRefresh: () => void }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
  
    const handleRefresh = async () => {
      setIsRefreshing(true);
      await onRefresh();
      toast.success('Incidents Synced', {
        icon: '🛰️',
        style: { background: '#0a0a0c', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)' }
      });
      setTimeout(() => setIsRefreshing(false), 1000);
    };
  
    return (
      <button
        onClick={handleRefresh}
        className="absolute bottom-52 right-10 z-40 p-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/20 rounded-2xl backdrop-blur-xl transition-all shadow-2xl group"
        title="Refresh Incidents"
      >
        <RefreshCw className={`w-6 h-6 group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    );
  };

const SafeRoute = ({ path, isCompromised }: { path: any[], isCompromised?: boolean }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const glowRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !path || path.length === 0) {
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (glowRef.current) glowRef.current.setMap(null);
      return;
    }

    // Convert to plain objects if needed
    const points = path.map(p => {
        if (typeof p.lat === 'function') return { lat: p.lat(), lng: p.lng() };
        return { lat: p.lat, lng: p.lng };
    });

    const color = isCompromised ? '#ef4444' : '#3b82f6';

    // Core Path
    if (polylineRef.current) {
      polylineRef.current.setPath(points);
      polylineRef.current.setMap(map);
      polylineRef.current.setOptions({
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        zIndex: 100,
      });
    } else {
      polylineRef.current = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        map,
        zIndex: 100,
      });
    }

    // Glow Effect
    if (glowRef.current) {
        glowRef.current.setPath(points);
        glowRef.current.setMap(map);
        glowRef.current.setOptions({
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: 12,
          zIndex: 99,
        });
      } else {
        glowRef.current = new google.maps.Polyline({
          path: points,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: 12,
          map,
          zIndex: 99,
        });
      }

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (glowRef.current) glowRef.current.setMap(null);
    };
  }, [map, path, isCompromised]);

  return null;
};

const CrowdMap = () => {
  const { 
    reports, 
    userLocation, 
    isReporting, 
    reportLocation, 
    setReportLocation, 
    safeRoute, 
    isAdminMode,
    isNavigating,
    destination,
    setDestination,
    setNavigationTargetName,
    setSafeRoute,
    setAvailableRoutes,
    isPathCompromised,
    setPathCompromised,
    setNavigationAlert,
    isSelectingDestination,
    setIsSelectingDestination,
    fetchReports,
    user
  } = useStore();
  
  const [activeReport, setActiveReport] = useState<any>(null);
  const [lastProximityAlert, setLastProximityAlert] = useState<number>(0);
  const prevDistancesRef = useRef<Record<string, number>>({});
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const campusCenter = { lat: 23.1777, lng: 80.0250 };

  useEffect(() => {
    if (userLocation) {
      // 2. Trajectory Alerts for Dangerous Reports
      reports.filter(r => r.type === 'dangerous' && ['pending', 'monitoring'].includes(r.status)).forEach(report => {
        const reportCoords = { lat: report.location.coordinates[1], lng: report.location.coordinates[0] };
        const distance = calculateDistance(userLocation.lat, userLocation.lng, reportCoords.lat, reportCoords.lng);
        const prevDistance = prevDistancesRef.current[report._id];

        if (distance < 150 && prevDistance && distance < prevDistance) {
            // User is moving CLOSER to a dangerous area within 150m
            const now = Date.now();
             if (now - lastProximityAlert > 15000) {
                toast.error(`⚠️ PATH INTERCEPTED: You are approaching a critical incident. Adjusting guardian flow.`, {
                    duration: 8000,
                    icon: '🛰️',
                    style: { background: '#0a0a0c', color: '#fff', border: '2px solid #ef4444' }
                });
                setLastProximityAlert(now);
             }
        }
        prevDistancesRef.current[report._id] = distance;
      });
    }
  }, [userLocation, reports, lastProximityAlert]);

  // Handle Intelligent Routing
  useEffect(() => {
    if (!isNavigating || !destination || !userLocation) {
        if (!isNavigating) {
            setAvailableRoutes([]);
            setSafeRoute(null);
        }
        return;
    }

    if (!directionsServiceRef.current) {
        directionsServiceRef.current = new google.maps.DirectionsService();
    }

    const runRoutingPass = (origin: any, destination: any, waypoints: any[] = []) => {
        return new Promise<google.maps.DirectionsResult | null>((resolve) => {
            directionsServiceRef.current?.route({
                origin,
                destination,
                waypoints: waypoints.map(w => ({ location: w, stopover: false })),
                travelMode: google.maps.TravelMode.WALKING,
                provideRouteAlternatives: true
            }, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) resolve(result);
                else resolve(null);
            });
        });
    };

    const analyzeResult = (result: google.maps.DirectionsResult) => {
        const dangerZones = reports.filter(r => r.type === 'dangerous' && ['pending', 'monitoring'].includes(r.status));
        return result.routes.map(route => {
            let dangerScore = 0;
            let totalDistance = 0;
            let firstBreachCoord: google.maps.LatLng | null = null;

            // 1. Calculate Total Distance across all legs (critical for detours)
            route.legs.forEach(leg => {
                totalDistance += leg.distance?.value || 0;
            });

            // 2. High-precision sampling (every 2nd point for absolute safety)
            route.overview_path.forEach((point, index) => {
                if (index % 2 === 0) {
                    dangerZones.forEach(danger => {
                        const dist = calculateDistance(
                            point.lat(), point.lng(),
                            danger.location.coordinates[1], danger.location.coordinates[0]
                        );
                        if (dist < 100) {
                            dangerScore += 1;
                            if (!firstBreachCoord) firstBreachCoord = point;
                        }
                    });
                }
            });

            // Absolute Wall Logic: Danger Score of 1 is treated as infinitely worse than any distance
            const weightedScore = (dangerScore * 10000000) + totalDistance;

            return { 
                route, 
                dangerScore, 
                totalDistance, 
                weightedScore,
                firstBreachCoord 
            };
        }).sort((a, b) => a.weightedScore - b.weightedScore);
    };

    const initiation = async () => {
        const origin = { lat: Number(userLocation.lat), lng: Number(userLocation.lng) };
        const dest = { lat: Number(destination.lat), lng: Number(destination.lng) };

        // Pass 1: Standard Routing Matrix
        const primaryResult = await runRoutingPass(origin, dest);
        if (!primaryResult) return;

        let analyzed = analyzeResult(primaryResult);
        let safest = analyzed[0];

        // Pass 2: Radical Deep Search (Treating Danger as an Absolute Wall)
        if (safest.dangerScore > 0 && safest.firstBreachCoord) {
            const breach = safest.firstBreachCoord;
            console.log("🛡️ REGION BREACHED. Initiating Radical Deep Search (400m Offset)...");
            
            // Probe 8 directions at a 400m distance to force entirely different roads (e.g., Campus Backway)
            const escapeVectors = [0, 90, 180, 270, 45, 135, 225, 315];
            let perfectlySafeAlternatives: any[] = [];

            const primaryPathMidpoint = {
                lat: (origin.lat + dest.lat) / 2,
                lng: (origin.lng + dest.lng) / 2
            };

            for (const angle of escapeVectors) {
                // Try offsetting from BOTH the breach point AND the journey midpoint
                const pivot: any = angle % 90 === 0 ? primaryPathMidpoint : breach;
                const pLat = typeof pivot.lat === 'function' ? pivot.lat() : pivot.lat;
                const pLng = typeof pivot.lng === 'function' ? pivot.lng() : pivot.lng;

                const detourPoint = calculateOffsetPoint(
                    pLat,
                    pLng,
                    angle % 90 === 0 ? 600 : 400, // Larger nudges mid-journey
                    angle
                );

                const detourResult = await runRoutingPass(origin, dest, [detourPoint]);
                if (detourResult) {
                    const analyzedDetour = analyzeResult(detourResult);
                    const safeOnes = analyzedDetour.filter(a => a.dangerScore === 0);
                    if (safeOnes.length > 0) {
                      perfectlySafeAlternatives.push(...safeOnes);
                      // If we found a safe corridor, we prioritize it
                      if (safeOnes[0].totalDistance < safest.totalDistance * 3) break;
                    }
                }
            }

            if (perfectlySafeAlternatives.length > 0) {
                // Shortest of the Safe Logic
                perfectlySafeAlternatives.sort((a, b) => a.totalDistance - b.totalDistance);
                safest = perfectlySafeAlternatives[0];
                analyzed = perfectlySafeAlternatives;
                console.log("🛰️ Tactical Matrix Re-calculated: Absolute Safe Corridor Found.");
            }
        }

        setAvailableRoutes(analyzed);
        setSafeRoute(safest.route.overview_path);
        
        if (safest.dangerScore > 0) {
            setPathCompromised(true);
            setNavigationAlert("CRITICAL: REGION TOTALLY COMPROMISED. MISSION ABORT RECOMMENDED.");
            toast.error("⚠️ REGION UNPASSABLE: Abandoning route for safety.", { duration: 6000 });
        } else {
            setPathCompromised(false);
            setNavigationAlert(null);
            const isDetour = analyzed.length > 0 && safest.totalDistance > primaryResult.routes[0].legs[0].distance?.value!;
            if (isDetour) {
                toast.success("🛡️ GUARDIAN DETOUR: Radical alternative selected for safety.", { icon: '🛡️' });
            } else {
                toast.success("🛡️ GUARDIAN PATH: Safest efficient corridor locked.", { icon: '🛡️' });
            }
        }
    };

    initiation();
  }, [destination, reports, userLocation, isNavigating]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isInvalidKey = !apiKey || apiKey.includes('your_google_maps_api_key');

  return (
    <div className="w-full h-full min-h-[600px] relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 bg-[#0a0a0c] flex items-center justify-center">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-0 bg-[#08080a]">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">Initializing Surveillance Matrix</p>
      </div>

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
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={campusCenter}
            defaultZoom={16}
            colorScheme="DARK"
            disableDefaultUI={true}
            gestureHandling={'greedy'}
            id="surveillance-map"
            mapId="DEMO_MAP_ID"
            onClick={(e) => {
              if (isSelectingDestination) {
                const target = { lat: e.detail.latLng?.lat || 0, lng: e.detail.latLng?.lng || 0 };
                setDestination(target);
                setNavigationTargetName(`Sector ${target.lat.toFixed(4)}, ${target.lng.toFixed(4)}`);
                // Auto-confirm selection by closing the mode
                setIsSelectingDestination(false);
              } else if (isReporting) {
                setReportLocation({ lat: e.detail.latLng?.lat || 0, lng: e.detail.latLng?.lng || 0 });
              } else if (isNavigating && !destination) {
                const target = { lat: e.detail.latLng?.lat || 0, lng: e.detail.latLng?.lng || 0 };
                setDestination(target);
                setNavigationTargetName(`Sector ${target.lat.toFixed(4)}, ${target.lng.toFixed(4)}`);
                if (userLocation) {
                    setSafeRoute([userLocation, target]);
                }
              } else {
                setActiveReport(null);
              }
            }}
          >
            <RecenterButton userLocation={userLocation} />
            {user?.role === 'org' && <RefreshButton onRefresh={fetchReports} />}
            {!isAdminMode && <SafeRoute path={safeRoute || []} isCompromised={isPathCompromised} />}
            <NavigationPanel />
            
            {reportLocation && (
              <AdvancedMarker position={reportLocation}>
                <div className="w-12 h-12 bg-red-500/20 rounded-full border-4 border-red-500 animate-pulse flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                   <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </AdvancedMarker>
            )}

            {isReporting && destination && (
               <AdvancedMarker position={destination}>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full border-2 border-blue-500 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 animate-bounce">
                     <Target className="w-5 h-5 text-blue-500" />
                  </div>
               </AdvancedMarker>
            )}
            
            {userLocation && (
              <AdvancedMarker position={userLocation}>
                <div className="user-location-dot" />
              </AdvancedMarker>
            )}

              {reports.map((report) => {
                const isDangerous = report.type === 'dangerous';
                
                // Visibility Logic
                if (user?.role === 'citizen') {
                    if (report.status === 'cleared') return null;
                } else if (user?.role === 'org') {
                    const isPending = report.status === 'pending';
                    const isMyMonitoring = report.status === 'monitoring' && report.org_id === user.userId;
                    if (!isPending && !isMyMonitoring) return null;
                }
               
               return (
                <AdvancedMarker
                  key={report._id}
                  position={{
                    lat: report.location.coordinates[1],
                    lng: report.location.coordinates[0],
                  }}
                  onClick={() => setActiveReport(report)}
                >
                  {isAdminMode && isDangerous ? (
                    <div className="relative group cursor-pointer">
                       <div className="w-12 h-12 bg-red-500/20 rounded-full border-2 border-red-500 animate-ping absolute -inset-0" />
                       <div className="w-12 h-12 bg-black border-2 border-red-500 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                       </div>
                       
                       <AnimatePresence>
                         {activeReport?._id === report._id && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10, scale: 0.9 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 glass-card rounded-3xl border border-red-500/30 overflow-hidden shadow-3xl pointer-events-auto"
                           >
                              {report.image_url && (
                                <div className="h-32 w-full overflow-hidden">
                                   <img src={report.image_url} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="p-4">
                                <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">CRITICAL INCIDENT</p>
                                <p className="text-[11px] text-white/90 leading-tight line-clamp-3">{report.description}</p>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  ) : (
                    <Pin 
                        background={isDangerous ? '#ef4444' : '#3b82f6'} 
                        glyphColor={'#ffffff'} 
                        borderColor={'#000000'} 
                    />
                  )}
                </AdvancedMarker>
               );
            })}

          </Map>
        </APIProvider>
      )}
    </div>
  );
};

export default CrowdMap;
