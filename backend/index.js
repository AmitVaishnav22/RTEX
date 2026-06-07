import connectDB from "./db/db.js";
import dotenv from "dotenv"
import {app} from "./app.js"
import express from "express"
import http, { createServer } from "http"
import {Server} from "socket.io"
import { setupWebSocket } from "./services/webSocketService.js";
import { setupExpoWebSocket } from "./services/webSocketExpo.js";
import { syncImpressions } from "./workers/syncImpressions.js";
import { ConnectToRabbitMQ } from "./services/rabbitmq/connection.js";
import { setupRabbitMQ } from "./services/rabbitmq/setup.js";
import { sendWeeklyDigest , runWeeklyDigestServiceIfNeeded} from "./workers/weeklyDigest.js";
import cron from "node-cron";

dotenv.config({
  path:'./.env'
})

cron.schedule("*/1 * * * *", async () => { 
  console.log("Running sync job...");
  await syncImpressions();
});

const server=createServer(app)
connectDB().then(async ()=>{
  await ConnectToRabbitMQ();
  await setupRabbitMQ();
  const io=setupWebSocket(server)
  const expoIo=setupExpoWebSocket()
  server.listen(process.env.PORT|| 7000,()=>{
  console.log(`Server running at port : ${process.env.PORT}`)
  runWeeklyDigestServiceIfNeeded()
      .catch(err =>
        console.error("Weekly digest failed:", err)
      );
  })
}).catch((error)=>{
  console.log("MONGO DB CONNECTION ERROR",error)
})

if (process.env.NODE_ENV === 'start'){
  console.log("Starting background workers................", process.env.NODE_ENV);
  const { startBackgroundWorkers } = await import("./background-workers/background-index.js");
  await startBackgroundWorkers();
} 

// sendWeeklyDigest().catch(err => console.error("Error sending weekly digest:", err));