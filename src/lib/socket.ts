import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket | null> => {
  if (typeof window === 'undefined') return null;
  
  if (!socket) {
    try {
      // 初始化 Socket.IO 服务器
      const response = await fetch('/api/socketio');
      if (!response.ok) {
        throw new Error('Failed to initialize socket server');
      }
      
      // 創建 socket 實例
      socket = io(window.location.origin, {
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
      socket.on('connect', () => {
        console.log('Socket connected successfully:', socket?.id);
      });

      socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      });

      socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect' && socket) {
          // 服務器主動斷開連接，需要手動重連
          socket.connect();
        }
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      socket = null;
    }
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
}; 