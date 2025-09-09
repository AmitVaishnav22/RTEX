import { redisSubscriber } from "./redis.js";
import { broadcastToClients } from "./websocket.js";

export const setupSubscriber = async () => {
  await redisSubscriber.subscribe("letters", (message) => {
    const event = JSON.parse(message);
    console.log("Received event from Redis:", event);

    // Broadcast to all Expo WebSocket clients
    broadcastToClients(event);
  });
};

