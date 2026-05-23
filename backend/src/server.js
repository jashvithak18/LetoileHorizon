import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure socket.io with wildcard CORS for local demo ease
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Bind Socket.io in Express context for controllers to leverage
app.set('socketio', io);

// API Mappings
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Core health endpoint
app.get('/', (req, res) => {
  res.json({
    brand: "L'Étoile Horizon",
    status: 'Operational',
    concept: 'Luxury Molecular Fine Dining API Server',
    version: '1.0.0'
  });
});

// Socket connectivity rules
io.on('connection', (socket) => {
  console.log(`✨ Gourmet guest synced via WebSockets: ${socket.id}`);

  socket.on('joinReservations', () => {
    socket.join('reservations_room');
    console.log(`Diner joined floor plan sync stream: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`👋 Diner departed socket stream: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌌 L'Étoile Horizon API Server glowing on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
