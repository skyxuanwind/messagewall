'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { Message } from '@/types/message';
import { Socket } from 'socket.io-client';
import SocketClient from '@/lib/socket';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const MessageBubble = ({ message }: { message: Message }) => {
  const [position, setPosition] = useState({ x: message.style.x, y: message.style.y });

  useEffect(() => {
    const moveCloud = () => {
      setPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 2,
        y: prev.y + (Math.random() - 0.5) * 2
      }));
    };

    const interval = setInterval(moveCloud, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: message.style.scale,
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 20
      }}
      className={`absolute p-4 rounded-lg shadow-lg ${message.style.color} text-white max-w-sm backdrop-blur-sm bg-opacity-90`}
      style={{
        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
      }}
    >
      <h3 className="font-bold">{message.name}</h3>
      <p className="mt-2">{message.content}</p>
      {message.dream && (
        <p className="mt-2 text-sm opacity-80">夢幻引薦：{message.dream}</p>
      )}
      {message.image && (
        <div className="mt-2 relative h-32 w-full">
          <img
            src={message.image}
            alt="User uploaded"
            className="object-contain w-full h-full rounded-lg"
          />
        </div>
      )}
    </motion.div>
  );
};

export default function Wall() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isInitializing = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const setupSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setError(`連接錯誤: ${error.message}`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setError(`已斷開連接: ${reason}`);
    });

    socket.on('newMessage', (message: Message) => {
      console.log('Received message:', message);
      setMessages(prev => {
        const newMessages = [...prev, message];
        if (newMessages.length >= 20 && !showVideo) {
          setShowVideo(true);
        }
        return newMessages;
      });
    });
  }, [showVideo]);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      const socket = socketRef.current;
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('newMessage');
      SocketClient.disconnect();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;

      try {
        cleanupSocket();
        const socket = await SocketClient.getSocket();
        
        if (!socket || !mounted) {
          throw new Error('Socket initialization failed');
        }

        socketRef.current = socket;
        setupSocketListeners(socket);

      } catch (error) {
        if (mounted) {
          console.error('Socket initialization error:', error);
          setError(`初始化錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
          setIsConnected(false);
          
          // 5秒後自動重試
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mounted) {
              isInitializing.current = false;
              initSocket();
            }
          }, 5000);
        }
      } finally {
        if (mounted) {
          isInitializing.current = false;
        }
      }
    };

    initSocket();

    return () => {
      mounted = false;
      cleanupSocket();
    };
  }, [setupSocketListeners, cleanupSocket]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setShowVideo(false);
  }, []);

  const handleReconnect = useCallback(async () => {
    try {
      cleanupSocket();
      isInitializing.current = false;
      const socket = await SocketClient.getSocket();
      if (socket) {
        console.log('Attempting to reconnect...');
        socketRef.current = socket;
        setupSocketListeners(socket);
      }
    } catch (error) {
      console.error('Reconnection error:', error);
      setError(`重新連接錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [cleanupSocket, setupSocketListeners]);

  if (showVideo) {
    return (
      <div className="fixed inset-0 bg-black">
        <YouTube
          videoId="-tu7ZIZrO4Y"
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              fs: 1,
              controls: 0,
            },
          }}
          onEnd={() => setShowVideo(false)}
          className="w-full h-screen"
          onReady={(event: YouTubeEvent) => {
            event.target.playVideo();
          }}
        />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-blue-900 to-teal-500 overflow-hidden">
      <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white opacity-20 whitespace-nowrap">
        BNI富揚白金名人堂留言牆
      </h1>
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
          <button
            onClick={handleReconnect}
            className="ml-4 underline hover:no-underline"
          >
            重新連接
          </button>
        </div>
      )}

      {!isConnected && !error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          正在連接伺服器...
        </div>
      )}
      
      <AnimatePresence>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </AnimatePresence>

      <button
        onClick={handleReset}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors z-50"
      >
        重置留言
      </button>
    </main>
  );
} 