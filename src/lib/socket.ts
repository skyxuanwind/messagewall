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
        
        // 等待一小段時間確保服務器初始化完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.instance = io({
          path: '/api/socketio',
          addTrailingSlash: false,
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: false, // 禁用自動連接
        });

        // 手動連接
        this.instance.connect();

        // 添加连接事件监听器
        this.instance.on('connect', () => {
          console.log('Socket connected successfully:', this.instance?.id);
        });

        this.instance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.instance?.disconnect();
          this.instance = null;
          this.isInitializing = false;
        });

        this.instance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // 服務器主動斷開連接，需要手動重連
            this.instance?.connect();
          }
        });

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