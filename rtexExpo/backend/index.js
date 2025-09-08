// index.js
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { setupWebSocket } from "./websocket.js";
import { connectPublisher } from "./publisher.js";
import { connectSubscriber } from "./subscriber.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server);

// Connect Redis publisher + subscriber
Promise.all([connectPublisher(), connectSubscriber()])
  .then(() => {
    server.listen(process.env.EXPO_PORT || 7001, () => {
      console.log(`🚀 Retex Expo service running on port ${process.env.EXPO_PORT || 7001}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start service:", err);
    process.exit(1);
  });

// Basic health check
app.get("/", (req, res) => {
  res.send("Retex Expo Service is running ✅");
});
