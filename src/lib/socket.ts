import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static instance: Socket | null = null;
  private static isInitializing: boolean = false;

  public static async getSocket(): Promise<Socket | null> {
    if (typeof window === 'undefined') return null;
    
    if (!this.instance && !this.isInitializing) {
      this.isInitializing = true;
      
      try {
        // 初始化 Socket.IO 服务器
        const response = await fetch('/api/socketio');
        if (!response.ok) {
          throw new Error('Failed to initialize socket server');
        }
        
        // 創建 socket 實例
        const socket = io(window.location.origin, {
          path: '/api/socketio',
          addTrailingSlash: false,
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: false,
        });

        // 手動連接
        socket.connect();

        // 添加连接事件监听器
        socket.on('connect', () => {
          console.log('Socket connected successfully:', socket.id);
        });

        socket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error);
          socket.disconnect();
          this.instance = null;
          this.isInitializing = false;
        });

        socket.on('disconnect', (reason: string) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // 服務器主動斷開連接，需要手動重連
            socket.connect();
          }
        });

        this.instance = socket;

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        this.instance = null;
      } finally {
        this.isInitializing = false;
      }
    }

    return this.instance;
  }

  public static disconnect(): void {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
    this.isInitializing = false;
  }

  public static isConnected(): boolean {
    return this.instance?.connected || false;
  }
}

export default SocketClient; 