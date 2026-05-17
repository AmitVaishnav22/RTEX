import rateLimit from "express-rate-limit";

const allowedOrigins = process.env.AllowOrigins ? process.env.AllowOrigins.split(',') : [];

console.log("Allowed Origins for Expo Service:", allowedOrigins);

const expoRateLimiter = rateLimit({
  windowMs : Number(process.env.GETDURATION), // 10 minutes
  max: Number(process.env.GETLIMIT), // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message : {
      error: "Too many requests, please try again later."
    }
  })
const authServiceKey = (req, res, next) => {
  const key = req.headers["x-rtex-key"];
  const origin = req.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden: Invalid Request" });
  }

  if (!key || key !== process.env.RTEX_EXPO_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid Service Key" });
  }

  next();
};

export {authServiceKey, expoRateLimiter};