import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static socket: Socket | null = null;

  public static async getSocket(): Promise<Socket | null> {
    if (typeof window === 'undefined') return null;
    
    if (!this.socket) {
      try {
        // 初始化 Socket.IO 服务器
        const response = await fetch('/api/socketio');
        if (!response.ok) {
          throw new Error('Failed to initialize socket server');
        }
        
        // 創建 socket 實例
        this.socket = io(window.location.origin, {
          path: '/api/socketio',
          addTrailingSlash: false,
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        // 添加连接事件监听器
        this.socket.on('connect', () => {
          console.log('Socket connected successfully:', this.socket?.id);
        });

        this.socket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error);
          if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
          }
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect' && this.socket) {
            // 服務器主動斷開連接，需要手動重連
            this.socket.connect();
          }
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        this.socket = null;
      }
    }

    return this.socket;
  }

  public static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public static isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default SocketClient; 