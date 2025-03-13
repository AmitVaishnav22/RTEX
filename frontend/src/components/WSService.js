// import {io} from 'socket.io-client';  

// const socket = io("http://localhost:8000", {
//     transports: ["websocket", "polling"],  // Use both transports for fallback
//     withCredentials: true,  // Ensure proper authentication handling
//   });
// export const joinRoom = (roomId, username) => {
//     socket.emit("join-room", { roomId, username });
// };

// export const sendContent = (roomId, content) => {
//     socket.emit("send-content", { roomId, content });
// };

// export const onReceiveContent = (callback) => {
//     socket.on("receive-content", (content) => {
//       callback(content);
//     });
// };

// export const onUserJoined = (callback) => {
//     socket.on("user-joined", ({ username }) => {
//       callback(username);
//     });
// };


// export default socket;