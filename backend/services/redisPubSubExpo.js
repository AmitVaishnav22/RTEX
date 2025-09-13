import { createClient } from "redis";

const baseConfig = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};

export const expoPublisher = createClient(baseConfig);
export const expoSubscriber = createClient(baseConfig);

expoPublisher.on("error", (err) => console.error("Expo Publisher error:", err));
expoSubscriber.on("error", (err) => console.error("Expo Subscriber error:", err));

export const connectExpoRedis = async () => {
  await expoPublisher.connect();
  await expoSubscriber.connect();
  console.log("Expo Redis Pub/Sub connected");
};
