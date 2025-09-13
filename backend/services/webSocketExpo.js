import { subscriber } from "./redisService.js";
import { io } from "./webSocketService.js";

const setupExpoWebSocket = async() => {

  await subscriber.subscribe("rtex-events", (message) => {
    try {
      const { event, data } = JSON.parse(message);
      //console.log("data recievd",data);
      if (io) {
        io.emit(event, data);
      } else {
        console.warn("No io instance yet, skipping emit");
      }
    } catch (err) {
      console.error("Failed to handle event:", err);
    }
  });
};

export { setupExpoWebSocket};

