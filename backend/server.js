const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { simulateUsers } = require('./services/simulationService');

// Routes
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for the hackathon
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/reports', reportsRoutes);

// Socket.IO middleware (optional: JWT check)
io.use((socket, next) => {
    // We can verify token here if needed
    next();
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('updateLocation', (data) => {
        // Broadcast location to family members
        // socket.to(familyGroupId).emit('familyAlert', data);
        console.log(`User ${socket.id} location updated:`, data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Simulation endpoint
app.get('/api/simulate/start', (req, res) => {
    const lat = parseFloat(process.env.SIMULATION_LAT) || 40.7128;
    const lng = parseFloat(process.env.SIMULATION_LNG) || -74.0060;
    const count = parseInt(process.env.SIMULATION_USER_COUNT) || 50;

    simulateUsers(io, count, { lat, lng });
    res.json({ message: 'Simulation started' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
