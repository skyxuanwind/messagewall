'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/next';

export default function WallClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
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
          setError(null);
        });

        socket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error);
          setError(`連接錯誤: ${error.message}`);
          socket.disconnect();
          socketRef.current = null;
        });

        socket.on('disconnect', (reason: string) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect' && socket) {
            socket.connect();
          }
        });

        socket.on('message', (message: Message) => {
          setMessages(prev => [...prev, message]);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setError(`初始化錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
        socketRef.current = null;
      }
    };

    if (!socketRef.current) {
      initSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => {
            socketRef.current = null;
            setError(null);
            window.location.reload();
          }}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          重新連接
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative min-h-[600px] w-full max-w-4xl overflow-hidden rounded-lg bg-white p-8 shadow-lg">
        <div className="absolute inset-0 flex flex-wrap content-start gap-4 overflow-auto p-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className="flex max-w-xs flex-col rounded-lg bg-blue-100 p-4 shadow"
              style={{
                backgroundColor: `hsl(${(index * 137) % 360}, 70%, 85%)`,
              }}
            >
              <div className="font-bold">{message.name}</div>
              <div>{message.content}</div>
              {message.dream && (
                <div className="mt-2 text-sm text-gray-600">
                  夢想：{message.dream}
                </div>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="uploaded"
                  className="mt-2 max-h-32 w-auto rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 