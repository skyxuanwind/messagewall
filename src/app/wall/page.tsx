'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { Message } from '@/types/message';
import { io } from 'socket.io-client';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

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
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const newSocket = io({
        path: '/api/socketio',
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('Connection error:', error.message);
        setError(`連接錯誤: ${error.message}`);
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Disconnected:', reason);
        setIsConnected(false);
        setError(`已斷開連接: ${reason}`);
      });

      newSocket.on('newMessage', (message: Message) => {
        console.log('Received message:', message);
        setMessages(prev => {
          const newMessages = [...prev, message];
          if (newMessages.length >= 20 && !showVideo) {
            setShowVideo(true);
          }
          return newMessages;
        });
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (err: any) {
      console.error('Socket initialization error:', err);
      setError(`初始化錯誤: ${err.message}`);
    }
  }, []);

  const handleReset = () => {
    setMessages([]);
    setShowVideo(false);
  };

  const handleReconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
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
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        重置留言
      </button>
    </main>
  );
} 