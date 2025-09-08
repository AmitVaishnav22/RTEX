const authServiceKey = (req, res, next) => {
  const key = req.headers["x-rtex-key"];

  if (!key || key !== process.env.RTEX_EXPO_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid Service Key" });
  }

  next();
};

export default authServiceKey;