// import { Server } from "socket.io";


// const rooms={}

// export const setupWebSocket = (server) => {
//     const io = new Server(server, {
//       cors: {
//         origin: "*", 
//         methods: ["GET", "POST"],
//       },
//     });

//     io.on("connection", (socket) => {
//         console.log(`⚡ New client connected: ${socket.id}`);
//         socket.on("join-room", ({ roomId, username }) => {
//             socket.join(roomId);
//             console.log(`${username} joined room ${roomId}`);
//             if (!rooms[roomId]) rooms[roomId] = { users: [] };
//             rooms[roomId].users.push(username);

//             socket.to(roomId).emit("user-joined", { username });
//             socket.emit("room-data", { roomId, users: rooms[roomId].users });
//         })
//         socket.on("send-content", ({ roomId, content }) => {
//             socket.to(roomId).emit("receive-content", content);
//         });
//         socket.on("disconnect", () => {
//             console.log("User disconnected");
//         });
//     });
//         return io;
// };