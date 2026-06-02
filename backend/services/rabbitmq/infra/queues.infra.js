import {getChannel} from "../connection.js";
import {EXCHANGES, QUEUES, ROUTING_KEYS} from "../queues.js";
async function setupOtpEmailInfrastructure(){
    const channel = await getChannel("otp-email-infra");
    await channel.assertExchange(EXCHANGES.AUTH,"direct",{ durable: true });
    // DLQ
    await channel.assertQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL_DLQ, { durable: true });
    await channel.bindQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL_DLQ, EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL_DLQ);
    // Main queue
    await channel.assertQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL, { durable: true });
    await channel.bindQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL, EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL);
    // Retry queue
    await channel.assertQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL_RETRY, { durable: true , messageTtl: 30000, deadLetterExchange: EXCHANGES.AUTH, deadLetterRoutingKey: ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL});
    await channel.bindQueue(QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL_RETRY, EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL_RETRY);
}

async function setupSubscriptionConfirmationInfrastructure(){
    const channel = await getChannel("subscription-infra");
    await channel.assertExchange(EXCHANGES.SUBSCRIPTION,"direct",{ durable: true });
    // DLQ 
    await channel.assertQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION_DLQ, { durable: true });
    await channel.bindQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION_DLQ, EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION_DLQ);
    // Main queue 
    await channel.assertQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION, { durable: true });
    await channel.bindQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION, EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION);
    // Retry queue
    await channel.assertQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION_RETRY, { durable: true , messageTtl: 30000, deadLetterExchange: EXCHANGES.SUBSCRIPTION, deadLetterRoutingKey: ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION});
    await channel.bindQueue(QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION_RETRY, EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION_RETRY);
}


export { setupOtpEmailInfrastructure , setupSubscriptionConfirmationInfrastructure};