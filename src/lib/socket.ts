import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static instance: Socket | null = null;

  public static getSocket(): Socket | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.instance) {
      this.instance = io(window.location.origin, {
        path: '/api/socketio',
        addTrailingSlash: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
    }

    return this.instance;
  }

  public static disconnect(): void {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
  }
}

export default SocketClient; 