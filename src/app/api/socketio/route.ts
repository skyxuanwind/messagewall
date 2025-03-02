import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handler(req: NextRequest, res: any) {
  try {
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

    return new Response('Socket.IO server running', { status: 200 });
  } catch (error) {
    console.error('Socket.IO server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export { handler as GET, handler as POST }; 