import { create } from 'zustand';
import axios from 'axios';

interface User {
  _id: string;
  role: 'citizen' | 'org';
  email: string;
  phone?: string;
  fullName?: string;
  userId?: string; // e.g. CTZ001 or ORG001
  documentId?: string; // e.g. DOC001
  organizationId?: string;
  organizationType?: string;
  city?: string;
  familyMembers?: Array<{ name: string; mobile: string }>;
  token: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  coins?: number;
  confidenceScore?: number;
  correctReports?: number;
  falseReports?: number;
  badges?: 'newbie' | 'knight' | 'pro' | 'true citizen';
  totalReports?: number;
  respondedReports?: number;
  clearedReports?: number;
}

interface Report {
  _id: string;
  user: string; // ObjectId
  ctz_id: string; // sequential ID
  org_id: string | null; // sequential ID
  location: {
    coordinates: [number, number];
  };
  image_url: string;
  description: string;
  type: 'normal' | 'dangerous';
  status: 'pending' | 'monitoring' | 'cleared';
  created_at: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
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
  updateReportStatus: (reportId: string, status: 'pending' | 'monitoring' | 'cleared') => void;
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
  fetchReports: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (userData) => set((state) => ({ 
    user: state.user ? { ...state.user, ...userData } : null 
  })),
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
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
  fetchReports: async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reports`);
      set({ reports: data });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  },
}));
