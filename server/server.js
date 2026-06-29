require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://smartharbour.onrender.com'
];
if (process.env.CLIENT_URL) {
  const envOrigins = process.env.CLIENT_URL.split(',').map(url => url.trim());
  envOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
socketHandler(io);
app.set('io', io); // Make io accessible in controllers via req.app.get('io')

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const shipRoutes = require('./routes/shipRoutes');
const berthRoutes = require('./routes/berthRoutes');
const dockingRoutes = require('./routes/dockingRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ships', shipRoutes);
app.use('/api/berths', berthRoutes);
app.use('/api/docking', dockingRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root check
app.get('/', (req, res) => {
  res.json({ message: '⚓ Harbour Management API is running...', status: 'OK' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚢 Harbour Management Server running on port ${PORT}`);
});
