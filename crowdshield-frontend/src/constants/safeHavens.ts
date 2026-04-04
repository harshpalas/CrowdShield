export interface SafeHaven {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'security' | 'medical' | 'admin';
}

export const SAFE_HAVENS: SafeHaven[] = [
  { id: 'sec-main-gate', name: 'Main Gate Security Post', lat: 23.1751, lng: 80.0235, type: 'security' },
  { id: 'sec-hall-3', name: 'Hall-3 Security Deck', lat: 23.1765, lng: 80.0260, type: 'security' },
  { id: 'med-center', name: 'Campus Health Center', lat: 23.1780, lng: 80.0245, type: 'medical' },
  { id: 'adm-block', name: 'Administrative Safety Hub', lat: 23.1772, lng: 80.0252, type: 'admin' },
  { id: 'sec-hall-4', name: 'Hall-4 Security Outpost', lat: 23.1790, lng: 80.0270, type: 'security' },
];
