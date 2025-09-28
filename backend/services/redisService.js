import { createClient } from "redis";
import Letter from "../models/letters.model.js";

const baseConfig = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
};

const client = createClient(baseConfig);
const publisher = createClient(baseConfig);
const subscriber = createClient(baseConfig);

client.on("connect", () => console.log("Redis client connected"));
publisher.on("connect", () => console.log("Redis publisher connected"));
subscriber.on("connect", () => console.log("Redis subscriber connected"));

client.on("error", (err) => console.log("Redis client error", err));
publisher.on("error", (err) => console.log("Redis publisher error", err));
subscriber.on("error", (err) => console.log("Redis subscriber error", err));

const connectRedis = async () => {
  await client.connect();
  await publisher.connect();
  await subscriber.connect();
  console.log("Redis connected successfully (cache + pub/sub)");
};

connectRedis();

const publishEvent = async (event, data) => {
  try {
    await publisher.publish("rtex-events", JSON.stringify({ event, data }));
  } catch (err) {
    console.error("Failed to publish event", err);
  }
};

const setCache=async (key,val,expiration) => {
    try {
        if (expiration && expiration > 0) {
            await client.setEx(key, expiration, JSON.stringify(val));
        } else {
            await client.set(key, JSON.stringify(val)); 
    }
    } catch (error) {
        console.log(`Error setting cache ${key}`, error)
    }
}

const getCache=async (key) => {
    try {
        const cachedData= await client.get(key)
        if(cachedData){
            return JSON.parse(cachedData)
        }
        return null
    } catch (error) {
        console.log(`Error getting cache ${key}`, error)
        return null
    }
}

const delCache=async (key) => {
    try {
        await client.del(key)
    } catch (error) {
        console.log(`Error deleting cache ${key}`, error)
    }
}
const checkEncryption=async (publicId) => {
    try {
      const letter = await Letter.findOne({ publicId });
      return !!letter?.passcode;
    } catch (error) {
      console.log(`Error checking encryption for ${publicId}`, error)
      return false 
    }
}

const incimpressionCount=async (publicId,step=1) => {
  try {
    const key = `impressions:${publicId}`;
    await client.incrBy(key,step);
    return null;
  } catch (error) {
    console.log(`Error incrementing count for ${publicId}`, error)
    return null;
  }
}

const getimpressionCount=async (publicId) => {
  try {
    const key = `impressions:${publicId}`;
    const value = await client.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.log(`Error getting impression count for ${publicId}`, error)
    return null;
  }
}

const getAllImpressionSync=async () => {
  try {
    return await client.keys('impressions:*');
  } catch (error) {
    console.log(`Error getting all impression keys`, error)
    return [];
  }
}
const resetImpressionCount=async (publicId) => {
  try {
    const key = `impressions:${publicId}`;
    await client.del(key);
    return null;
  } catch (error) {
    console.log(`Error resetting impression count for ${publicId}`, error)
    return null;
  }
}

export { 
    connectRedis,
    setCache,
    getCache,
    delCache,
    publishEvent,
    subscriber,
    checkEncryption,
    incimpressionCount,
    getimpressionCount,
    getAllImpressionSync,
    resetImpressionCount
}   