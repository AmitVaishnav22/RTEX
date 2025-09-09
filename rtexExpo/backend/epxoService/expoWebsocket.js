import { WebSocketServer } from "ws";

let wss;

export const setupWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Expo client connected ");

    ws.on("close", () => {
      console.log("Expo client disconnected");
    });
  });

  return wss;
};

export const broadcastToClients = (event) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
};
