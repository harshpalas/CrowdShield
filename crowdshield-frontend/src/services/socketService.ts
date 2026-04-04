import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('heatmapSync', (data) => {
      useStore.getState().setHeatmapData(data);
    });

    this.socket.on('newReportMarker', (report) => {
      useStore.getState().addReport(report);
    });

    this.socket.on('familyAlert', (alert) => {
      // In a real app we'd trigger a local notification
      console.log('Family alert:', alert);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
