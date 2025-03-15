import { Server } from "socket.io";

const rooms = {}; 

export const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    console.log(`New client connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, username }) => {
      if(!roomId || !username) {
        console.error("No roomId provided for WebSocket connection",roomId);
        return;
      }

      console.log(`${username} joining room ${roomId}`);

      if (!rooms[roomId]) {
        rooms[roomId] = { users: [] };
      }

      if (rooms[roomId].users.length >= 2) {
        socket.emit("room-full", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);

      console.log(`${username} joined room ${roomId}`);

      rooms[roomId].users.push({ id: socket.id, username });

      io.to(roomId).emit("room-data", { roomId, users: rooms[roomId].users });

      socket.emit("room-joined", { roomId, users: rooms[roomId].users });
    });

    socket.on("send-content", ({ roomId, content }) => {

      console.log(`Content update in room ${roomId}:`, content);

      socket.to(roomId).emit("receive-content", content);
    });

    socket.on("user-typing", ({ roomId, username }) => {
      console.log(`${username} is typing in room ${roomId}`);
      socket.to(roomId).emit("user-type-changed", { username });
    });
    
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      for (const roomId in rooms) {

        const room = rooms[roomId];

        const userIndex = room.users.findIndex((user) => user.id === socket.id);

        if (userIndex !== -1) {

          const [removedUser] = room.users.splice(userIndex, 1);

          //socket.to(roomId).emit("user-left", { username: removedUser.username });

          io.to(roomId).emit("room-data", { roomId, users: room.users });
          if (room.users.length === 0) {

            delete rooms[roomId];
          }
        }
      }
    });
  });

  return io;
};
