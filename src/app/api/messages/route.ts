import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { MessageInput, Message } from '@/types/message';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

// 假设屏幕尺寸
const SCREEN_WIDTH = 1920;
const SCREEN_HEIGHT = 1080;

declare global {
  var io: any;
}

export async function POST(request: Request) {
  try {
    const input: MessageInput = await request.json();
    
    const message: Message = {
      ...input,
      id: uuidv4(),
      style: {
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * SCREEN_WIDTH * 0.8,
        y: Math.random() * SCREEN_HEIGHT * 0.8,
        scale: 0.8 + Math.random() * 0.4,
      },
    };

    if (global.io) {
      global.io.emit('newMessage', message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 