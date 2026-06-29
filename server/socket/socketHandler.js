const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a room based on user role (optional for targeted broadcasts)
    socket.on('joinRoom', (role) => {
      socket.join(role);
      console.log(`Socket ${socket.id} joined room: ${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast helpers (called from controllers via io instance)
  // These events are emitted using: req.app.get('io').emit(event, data)
  // Events:
  //  'dockingRequestCreated' - new docking request submitted
  //  'dockingApproved'       - docking approved + berth assigned
  //  'dockingRejected'       - docking rejected
  //  'cargoStatusUpdated'    - cargo status changed
};

module.exports = socketHandler;
