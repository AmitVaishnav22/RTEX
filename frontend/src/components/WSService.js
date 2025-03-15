import {io} from "socket.io-client"
export const setupWebSocket = (roomId, setUsersInRoom, setContent, userName) => {
    if (!roomId || !userName) {
      console.error("No roomId or userName provided for WebSocket connection");
      return null;
    }
  
    const socket = io("http://localhost:7000", {
      transports: ["websocket"],
      withCredentials: true,
    });
  
    socket.emit("join-room", { roomId, username: userName });
  
    socket.on("room-data", ({ users }) => {
      console.log("Updated users in room:", users);
      setUsersInRoom(users);
    });
  
    socket.on("receive-content", (content) => {
      console.log("Received content update:", content);
      setContent(content);
    });
  
    socket.on("room-joined", ({ roomId, users }) => {
      console.log(`Joined room: ${roomId}, Users:`, users);
      setUsersInRoom(users);
    });
    

    socket.on("user-left", ({ username }) => {
      console.log(`${username} left the room.`);
    //   const cursorIndicator = document.getElementById(`cursor-${username}`);
    //   if (cursorIndicator) {
    //     cursorIndicator.remove();
    // }
    });

  
    return socket;
  };
  