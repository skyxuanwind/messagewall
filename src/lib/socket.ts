import { io } from 'socket.io-client';

const getSocketInstance = () => {
  if (typeof window === 'undefined') return null;

  const socketConfig = {
    path: '/api/socketio',
    addTrailingSlash: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  };

  return io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, socketConfig);
};

export const socket = getSocketInstance(); 