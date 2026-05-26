import {getChannel} from "./connection.js";
import {QUEUES, EXCHANGES, ROUTING_KEYS} from "./queues.js";

async function setupRabbitMQ(){
    const channel=await getChannel("setup");
    await channel.assertExchange(EXCHANGES.AUTH, "direct", {durable: true});
    await channel.assertQueue(QUEUES.OTP_EMAIL, {durable: true});
    await channel.bindQueue(QUEUES.OTP_EMAIL, EXCHANGES.AUTH, ROUTING_KEYS.OTP_EMAIL);
    console.log('RabbitMQ setup completed');
}

export {setupRabbitMQ};