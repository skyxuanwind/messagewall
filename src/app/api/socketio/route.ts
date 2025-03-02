import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let io: ServerIO | undefined;

if (typeof io === 'undefined') {
  io = new ServerIO({
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
}

export async function GET() {
  return new Response('Socket.IO server running', { status: 200 });
}

export async function POST() {
  return new Response('Socket.IO server running', { status: 200 });
} 