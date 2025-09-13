import connectDB from "./db/db.js";
import dotenv from "dotenv"
import {app} from "./app.js"
import express from "express"
import http, { createServer } from "http"
import {Server} from "socket.io"
import { setupWebSocket } from "./services/webSocketService.js";
import { setupExpoWebSocket } from "./services/webSocketExpo.js";

dotenv.config({
  path:'./.env'
})

const server=createServer(app)
connectDB().then(()=>{
  const io=setupWebSocket(server)
  const expoIo=setupExpoWebSocket()
  server.listen(process.env.PORT|| 7000,()=>{
  console.log(`Server running at port : ${process.env.PORT}`)
  })
}).catch((error)=>{
  console.log("MONGO DB CONNECTION ERROR",error)
})

