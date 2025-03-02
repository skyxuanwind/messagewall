'use client';

import { useEffect, useState, Suspense } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket, isSocketConnected } from '@/lib/socket';
import { Message } from '@/types/next';
import dynamic from 'next/dynamic';

const YouTube = dynamic(() => import('react-youtube'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function WallClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      if (messages.length >= 2) {
        setShowVideo(true);
      }
    };

    socket.on('message', handleNewMessage);

    return () => {
      socket.off('message', handleNewMessage);
    };
  }, [socket, messages]);

  const resetMessages = () => {
    setMessages([]);
    setShowVideo(false);
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          重新連接
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {showVideo ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="relative">
            <Suspense fallback={<div>Loading...</div>}>
              <YouTube
                videoId="dQw4w9WgXcQ"
                opts={{
                  height: '390',
                  width: '640',
                  playerVars: {
                    autoplay: 1,
                  },
                }}
              />
            </Suspense>
            <button
              onClick={resetMessages}
              className="absolute -top-10 right-0 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              重置
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
} 