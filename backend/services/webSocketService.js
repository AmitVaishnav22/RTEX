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
        //console.error("No roomId provided for WebSocket connection",roomId);
        return;
      }

      //console.log(`${username} joining room ${roomId}`);
      //console.log("Rooms:", rooms);
      if (!rooms[roomId] || !Array.isArray(rooms[roomId])) {
        socket.emit("room-not-found", { message: "Room does not exist." });
        return;
      }
    
      if (rooms[roomId].users.length >= 2) {
        socket.emit("room-full", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);

      //console.log(`${username} joined room ${roomId}`);

      rooms[roomId].users.push({ id: socket.id, username });

      io.to(roomId).emit("room-data", { roomId, users: rooms[roomId].users });

      socket.emit("room-joined", { roomId, users: rooms[roomId].users });
    });

    socket.on("send-content", ({ roomId, content }) => {

      //console.log(`Content update in room ${roomId}:`, content);

      socket.to(roomId).emit("receive-content", content);
    });

    socket.on("send-cursor", ({ roomId, username, cursorPosition }) => {
      //console.log(`${username} is moving cursor in room ${roomId} and ${cursorPosition.left}`);
    
      socket.to(roomId).emit("receive-cursor", { username, cursorPosition });
    });
    
    
    
    socket.on("disconnect", () => {
      //console.log(`User disconnected: ${socket.id}`);

      for (const roomId in rooms) {

        const room = rooms[roomId];

        const userIndex = room.users.findIndex((user) => user.id === socket.id);

        if (userIndex !== -1) {

          const [removedUser] = room.users.splice(userIndex, 1);

          socket.to(roomId).emit("user-left", { username: removedUser.username });

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
