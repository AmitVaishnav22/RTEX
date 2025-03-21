import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())    

import authRouter from "./routes/authRoutes.js"
import letterRouter from "./routes/letterRoutes.js"
import aiServiceRouter from "./routes/aiServiceRoutes.js"

app.use("/auth",authRouter)
app.use("/letter",letterRouter)
app.use("/ai",aiServiceRouter)
export {
    app
}