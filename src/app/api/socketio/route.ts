import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CustomSocket extends NodeJS.Socket {
  server: any;
}

interface SocketResponse extends NextApiResponse {
  socket: CustomSocket;
}

const socketHandler = (req: NextRequest, res: SocketResponse) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
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

    res.socket.server.io = io;
  }

  res.end();
};

export { socketHandler as GET, socketHandler as POST }; 