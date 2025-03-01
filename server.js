const express = require('express');
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  // 初始化 Socket.io
  const io = new Server(server, {
    path: '/api/socketio',
    serveClient: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*']
    },
    connectTimeout: 45000,
    pingTimeout: 30000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    perMessageDeflate: true,
    httpCompression: true
  });
  
  // Socket.io 連接處理
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // 發送歡迎消息
    socket.emit('welcome', { message: 'Welcome to the message wall!' });
    
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error for client', socket.id, ':', error);
    });
  });

  // 导出 io 实例供其他模块使用
  global.io = io;

  // Express 中間件
  expressApp.use(express.json());
  
  // Socket.io 路由處理
  expressApp.get('/api/socketio', (req, res) => {
    res.end();
  });

  // 所有其他請求交給 Next.js 處理
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
}); 