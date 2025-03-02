import { Server as NetServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { Socket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ServerSocket extends Socket {
  server: NetServer & {
    io?: SocketServer;
  };
}

interface SocketResponse extends NextApiResponse {
  socket: ServerSocket;
}

export const initSocket = (res: SocketResponse) => {
  if (!res.socket.server.io) {
    const io = new SocketServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
}; 