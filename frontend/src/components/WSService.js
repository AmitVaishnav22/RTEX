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
      const activeUsernames = users.map((user) => user.username);
      document.querySelectorAll("[id^='cursor-']").forEach((cursorLabel) => {
  
        const labelUsername = cursorLabel.id.replace("cursor-", "");
        // Remove the cursor label if it doesn't belong to an active user
        if (!activeUsernames.includes(labelUsername)) {
          cursorLabel.remove();
        }
      });
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
      const cursorIndicator = document.getElementById(`cursor-${username}`);
      if (cursorIndicator) {
        cursorIndicator.remove();
    }
    });

    socket.on("receive-cursor", ({ username, cursorPosition }) => {
      console.log(`${username} moved their cursor`, cursorPosition);
      let cursorLabel = document.getElementById(`cursor-${username}`);
    
      if (!cursorLabel) {
        cursorLabel = document.createElement("div");
        cursorLabel.id = `cursor-${username}`;
        cursorLabel.innerText = username;
        cursorLabel.style.position = "absolute";
        cursorLabel.style.background = "#333";
        cursorLabel.style.color = "#fff";
        cursorLabel.style.padding = "4px 8px";
        cursorLabel.style.borderRadius = "5px";
        cursorLabel.style.fontSize = "12px";
        cursorLabel.style.whiteSpace = "nowrap";
        document.body.appendChild(cursorLabel);
      }
      
      cursorLabel.style.left = `${cursorPosition.left+140}px`;
      cursorLabel.style.top = `${cursorPosition.top +290}px`; 
    });
    

  
    return socket;
  };
  