import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())    

import authRouter from "./routes/authRoutes.js"
import letterRouter from "./routes/letterRoutes.js"

app.use("/auth",authRouter)
app.use("/letter",letterRouter)

export {
    app
}