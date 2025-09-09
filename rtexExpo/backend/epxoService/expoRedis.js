import { createClient } from "redis";

const baseConfig = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};

export const redisSubscriber = createClient(baseConfig);

const attachListeners = (client, name) => {
  client.on("connect", () => console.log(`${name} connected `));
  client.on("error", (err) => console.error(`${name} error :`, err));
};

attachListeners(redisSubscriber, "Subscriber");

export const connectRedis = async () => {
  try {
    await redisSubscriber.connect();
    console.log("Redis Subscriber connected successfully ");
  } catch (error) {
    console.error("Redis connection failed :", error);
  }
};
