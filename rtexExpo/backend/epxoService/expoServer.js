// server.js
import { WebSocketServer } from "ws";
import { subscriber } from "./redis.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Subscribe to Redis events
await subscriber.subscribe("letters:new", (message) => {
  broadcast("letters:new", message);
});
await subscriber.subscribe("letters:update", (message) => {
  broadcast("letters:update", message);
});
await subscriber.subscribe("letters:delete", (message) => {
  broadcast("letters:delete", message);
});

function broadcast(type, message) {
  const payload = JSON.stringify({ type, data: JSON.parse(message) });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

console.log("WebSocket server running on ws://localhost:8080");
