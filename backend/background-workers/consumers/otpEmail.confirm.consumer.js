import {getChannel} from "../../services/rabbitmq/connection.js";
import {QUEUES, EXCHANGES, ROUTING_KEYS} from "../../services/rabbitmq/queues.js";
import {sendSubscriptionConfirmationEmail} from '../services/otpEmail.service.js';

const MAX_RETRIES = parseInt(process.env.OTP_CONSUMER_MAX_RETRIES || '3', 10);
const PREFETCH = parseInt(process.env.OTP_CONSUMER_PREFETCH || '5', 10);


async function startotpEmailConfirmConsumer() {
    const channel = await getChannel("subscription-confirmation-infra", { prefetch: PREFETCH });
    console.log('OTP Email confirmation consumer started, awaiting messages...');

    channel.consume(
        QUEUES.SUBSCRIPTION_CONFIRMATION_QUEUE.SUBSCRIPTION_CONFIRMATION,
        async (msg) => {
            if (!msg) return;
            try{
                const contentType = msg.properties.contentType || '';
                if(contentType && contentType !== 'application/json'){
                    console.warn('Skipping message with unsupported contentType:', contentType);
                    channel.ack(msg);
                    return;
                }
                try{
                    const {email} = JSON.parse(msg.content.toString());
                    if(!email){
                        console.error('Invalid payload: missing email. Acknowledging and dropping.', payload);
                        channel.ack(msg);
                        return;
                    }
                    console.log(`Received subscription confirmation for ${email}`);
                    await sendSubscriptionConfirmationEmail(email);
                    channel.ack(msg);
                    console.log(`Sent subscription confirmation email to ${email}`);
                }catch(err){
                    const retries = Number(msg.properties.headers['x-retries'] || 0);
                    if(retries >= MAX_RETRIES){
                        channel.publish(EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION_DLQ, Buffer.from(msg.content), {persistent: true, contentType: "application/json", headers: msg.properties.headers});
                        channel.ack(msg);
                        console.error('Max retries exceeded. Moved message to DLQ.', { headers: msg.properties.headers, retries });
                        return;
                    }
                    channel.publish(EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION_RETRY, Buffer.from(msg.content), {persistent: true, contentType: "application/json", headers: {...msg.properties.headers, 'x-retries': retries + 1}});
                    channel.ack(msg);
                    console.error('Error processing message. Retrying.', err, { headers: msg.properties.headers, retries });
                }
            }catch(err){
                console.error('Unexpected error in consumer:', err);
            }
        }
    )
}

export {startotpEmailConfirmConsumer};