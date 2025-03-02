import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log('*First use, starting socket.io');

    const io = new SocketIOServer((res.socket as any).server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
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

    (res.socket as any).server.io = io;
  } else {
    console.log('Socket.io already running');
  }
  res.end();
};

export default ioHandler; 