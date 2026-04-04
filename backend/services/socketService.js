const socketIo = require('socket.io');

let io;

function setupSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*", // In production, you should restrict this to your frontend's domain
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Example: Listen for a new report and broadcast it
    socket.on('new-report', (report) => {
      io.emit('report-update', report);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { setupSocket, getIo };
