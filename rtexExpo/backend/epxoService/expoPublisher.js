export const publishEvent = async (eventType, payload) => {
  try {
    const event = { type: eventType, data: payload, timestamp: Date.now() };
    await publisher.publish("letters", JSON.stringify(event));
    console.log(`Published event: ${eventType}`);
  } catch (err) {
    console.error("Failed to publish event ❌:", err);
  }
};
