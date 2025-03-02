import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      if (!socketRef.current) {
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
          });

          // 添加连接事件监听器
          socket.on('connect', () => {
            console.log('Socket connected successfully:', socket.id);
          });

          socket.on('connect_error', (error: Error) => {
            console.error('Socket connection error:', error);
            socket.disconnect();
            socketRef.current = null;
          });

          socket.on('disconnect', (reason: string) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect' && socket) {
              // 服務器主動斷開連接，需要手動重連
              socket.connect();
            }
          });

          socketRef.current = socket;
        } catch (error) {
          console.error('Failed to initialize socket:', error);
          socketRef.current = null;
        }
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
}

export function isSocketConnected(socket: Socket | null): boolean {
  return socket?.connected || false;
} 