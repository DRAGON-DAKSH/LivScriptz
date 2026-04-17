require('dotenv').config();            // ← Loads .env file

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fetch = require('node-fetch');   // ← Added for JDoodle proxy

// Credentials loaded from .env — never hardcode these
const JDOODLE_CLIENT_ID     = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));   // Make sure your index.html is inside a "public" folder

// ====================== JDoodle Proxy Route ======================

app.post('/api/execute', async (req, res) => {
  try {
    // Inject credentials here on the server — client never sends or sees them
    const payload = {
      ...req.body,
      clientId:     JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
    };

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('JDoodle proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to execute code on JDoodle', 
      message: error.message 
    });
  }
});
// ======================= Socket.io code ============================

const rooms = {};

function getRoom(roomId) {
  if (!rooms[roomId]) rooms[roomId] = { users: {}, files: [] };
  return rooms[roomId];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ room, name, color }) => {
    socket.join(room);
    socket.data = { room, name, color };

    const r = getRoom(room);
    r.users[socket.id] = { id: socket.id, name, color };

    socket.emit('room-state', {
      users: Object.values(r.users),
      files: r.files,
    });

    socket.to(room).emit('user-joined', { id: socket.id, name, color });
    console.log(`${name} joined room: ${room}`);
  });

  // socket handlers
  socket.on('code-change', ({ room, change, code, fileId }) => {
    const r = getRoom(room);
    const f = r.files.find(f => f.id === fileId);
    if (f) f.content = code;
    socket.to(room).emit('code-change', { change, code, fileId });
  });

  socket.on('file-added', ({ room, file }) => {
    const r = getRoom(room);
    if (!r.files.find(f => f.id === file.id)) r.files.push(file);
    socket.to(room).emit('file-added', { file });
  });

  socket.on('file-removed', ({ room, fileId }) => {
    const r = getRoom(room);
    r.files = r.files.filter(f => f.id !== fileId);
    socket.to(room).emit('file-removed', { fileId });
  });

  socket.on('file-renamed', ({ room, fileId, name }) => {
    const r = getRoom(room);
    const f = r.files.find(f => f.id === fileId);
    if (f) f.name = name;
    socket.to(room).emit('file-renamed', { fileId, name });
  });

  socket.on('file-switched', ({ room, fileId }) => {
    socket.to(room).emit('file-switched', { fileId });
  });

  socket.on('lang-change', ({ room, lang, fileId, fileName }) => {
    const r = getRoom(room);
    const f = r.files.find(f => f.id === fileId);
    if (f) { f.lang = lang; if (fileName) f.name = fileName; }
    socket.to(room).emit('lang-change', { lang, fileId, fileName });
  });

  socket.on('chat-message', (data) => {
    socket.to(data.room).emit('chat-message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', data);
  });

  socket.on('run-output', (data) => {
    socket.to(data.room).emit('run-output', data);
  });

  socket.on('disconnect', () => {
    const { room, name } = socket.data || {};
    if (!room) return;
    const r = getRoom(room);
    delete r.users[socket.id];
    io.to(room).emit('user-left', { id: socket.id, name });
    console.log(`${name} left room: ${room}`);
  });
});

const os = require('os');

server.listen(3000, '0.0.0.0', () => {
  // Get local WiFi IP automatically
  const nets = os.networkInterfaces();
  let localIP = 'unknown';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
      }
    }
  }
  console.log('✅ LivScriptz running at:');
  console.log(`   Local:   http://localhost:3000`);
  console.log(`   WiFi:    http://${localIP}:3000`);
  console.log(`   ngrok:   run "ngrok http 3000" for public URL`);
  console.log('JDoodle proxy ready at /api/execute');
});