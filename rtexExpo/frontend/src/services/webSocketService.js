import { io } from "socket.io-client";

const socket = io("https://rtex-1.onrender.com", {
  transports: ["websocket"],
});

export default socket;
