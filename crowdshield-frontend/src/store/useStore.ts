import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface CrowdPoint {
  location: {
    coordinates: [number, number];
  };
  density: number;
}

interface Report {
  _id: string;
  location: {
    coordinates: [number, number];
  };
  imageUrl: string;
  description: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  hotspots: Array<{ id: string; lat: number; lng: number; count: number; risk: string }>;
  setHotspots: (hotspots: Array<{ id: string; lat: number; lng: number; count: number; risk: string }>) => void;
  heatmapData: CrowdPoint[];
  setHeatmapData: (data: CrowdPoint[]) => void;
  reports: Report[];
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  isSimulating: boolean;
  setIsSimulating: (isSimulating: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user });
  },
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
  hotspots: [
    { id: 'danger-sector-7', lat: 23.176688, lng: 80.025584, count: 50, risk: 'CRITICAL' }
  ],
  setHotspots: (hotspots) => set({ hotspots }),
  heatmapData: [],
  setHeatmapData: (heatmapData) => set({ heatmapData }),
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  isSimulating: false,
  setIsSimulating: (isSimulating) => set({ isSimulating }),
}));
