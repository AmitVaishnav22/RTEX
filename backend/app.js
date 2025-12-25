import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true,
}))

app.use(express.json({limit:'2mb'}))
app.use(express.urlencoded({extended:true,limit:'2mb'}))
app.use(express.static("public"))
app.use(cookieParser())    

import authRouter from "./routes/authRoutes.js"
import letterRouter from "./routes/letterRoutes.js"
import aiServiceRouter from "./routes/aiServiceRoutes.js"
import expoRouter from "./routes/expoServiceRoutes.js"
import emailServiceRouter from "./routes/emailServiceRoutes/emailServiceRoutes.js"
import recapRouter from "./routes/2025-recapRoutes/recapRoutes.js"

app.use("/auth",authRouter)
app.use("/letter",letterRouter)
app.use("/ai",aiServiceRouter)
app.use("/expo",expoRouter)
app.use("/email",emailServiceRouter)
app.use("/recap",recapRouter)


export {
    app
}