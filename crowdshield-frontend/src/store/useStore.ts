import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
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
  type: 'normal' | 'dangerous';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
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
  isReporting: boolean;
  setIsReporting: (isReporting: boolean) => void;
  reportLocation: { lat: number; lng: number } | null;
  setReportLocation: (location: { lat: number; lng: number } | null) => void;
  safeRoute: any[] | null;
  setSafeRoute: (route: any[] | null) => void;
  isAdminMode: boolean;
  setIsAdminMode: (isAdminMode: boolean) => void;
  updateReportStatus: (reportId: string, status: 'pending' | 'investigating' | 'resolved' | 'dismissed') => void;
  destination: { lat: number; lng: number } | null;
  setDestination: (location: { lat: number; lng: number } | null) => void;
  navigationTargetName: string | null;
  setNavigationTargetName: (name: string | null) => void;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  availableRoutes: any[];
  setAvailableRoutes: (routes: any[]) => void;
  isPathCompromised: boolean;
  setPathCompromised: (isPathCompromised: boolean) => void;
  navigationAlert: string | null;
  setNavigationAlert: (alert: string | null) => void;
  isSelectingDestination: boolean;
  setIsSelectingDestination: (isSelectingDestination: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
  hotspots: [],
  setHotspots: (hotspots) => set({ hotspots }),
  heatmapData: [],
  setHeatmapData: (heatmapData) => set({ heatmapData }),
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  isSimulating: false,
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  isReporting: false,
  setIsReporting: (isReporting) => set({ isReporting }),
  reportLocation: null,
  setReportLocation: (reportLocation) => set({ reportLocation }),
  safeRoute: null,
  setSafeRoute: (safeRoute) => set({ safeRoute }),
  isAdminMode: false,
  setIsAdminMode: (isAdminMode) => set({ isAdminMode }),
  updateReportStatus: (reportId, status) => set((state) => ({
    reports: state.reports.map((r) => r._id === reportId ? { ...r, status } as Report : r)
  })),
  destination: null,
  setDestination: (destination) => set({ destination }),
  navigationTargetName: null,
  setNavigationTargetName: (navigationTargetName) => set({ navigationTargetName }),
  isNavigating: false,
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  availableRoutes: [],
  setAvailableRoutes: (availableRoutes) => set({ availableRoutes }),
  isPathCompromised: false,
  setPathCompromised: (isPathCompromised) => set({ isPathCompromised }),
  navigationAlert: null,
  setNavigationAlert: (navigationAlert) => set({ navigationAlert }),
  isSelectingDestination: false,
  setIsSelectingDestination: (isSelectingDestination) => set({ isSelectingDestination }),
}));
