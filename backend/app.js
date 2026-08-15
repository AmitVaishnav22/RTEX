import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import http from "http"

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

const RETOAI_SERVICE_URL = process.env.RETOAI_SERVICE_URL || "http://localhost:8000";

app.use("/retOai", (req, res) => {
  const target = new URL(RETOAI_SERVICE_URL);
  const targetPath = req.originalUrl.replace(/^\/retOai/, "") || "/";

  const proxyReq = http.request(
    {
      host: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: targetPath,
      method: req.method,
      headers: { ...req.headers },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("RETOAI proxy error:", err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: "RETOAI service unreachable" });
    }
  });

  req.pipe(proxyReq);
});

export {
    app
}
