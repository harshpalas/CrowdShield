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
  isAuthenticated: boolean;
  reports: Report[];
  heatmapData: any[];
  setUser: (user: User | null) => void;
  logout: () => void;
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  setHeatmapData: (data: any[]) => void;
}

const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  reports: [],
  heatmapData: [],
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  setHeatmapData: (data) => set({ heatmapData: data }),
}));

export default useStore;
