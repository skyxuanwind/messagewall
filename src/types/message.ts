export interface Message {
  id: string;
  name: string;
  content: string;
  dream?: string;
  image?: string;
  style: {
    color: string;
    x: number;
    y: number;
    scale: number;
  };
}

export type MessageInput = Omit<Message, 'id' | 'style'>; 