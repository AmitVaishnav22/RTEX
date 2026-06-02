import {getChannel} from "../../services/rabbitmq/connection.js";
import {QUEUES, EXCHANGES, ROUTING_KEYS} from "../../services/rabbitmq/queues.js";
import {sendSubscriptionConfirmationEmail} from '../services/otpEmail.service.js';

const MAX_RETRIES = parseInt(process.env.OTP_CONSUMER_MAX_RETRIES || '3', 10);
const PREFETCH = parseInt(process.env.OTP_CONSUMER_PREFETCH || '5', 10);


async function startotpEmailConfirmConsumer() {
    const channel = await getChannel("otp_email_confirm_consumer", { prefetch: PREFETCH });

    await channel.assertExchange(EXCHANGES.SUBSCRIPTION, "direct", { durable: true });
    await channel.assertQueue(QUEUES.OPT_CONFIRMATION, { durable: true });
    await channel.bindQueue(QUEUES.OPT_CONFIRMATION, EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.OPT_CONFIRMATION);

    console.log('OTP Email confirmation consumer started, awaiting messages...');

    channel.consume(
        QUEUES.OPT_CONFIRMATION,
        async (msg) => {
            if (!msg) return;
            try{
                const contentType = msg.properties.contentType || '';
                if(contentType && contentType !== 'application/json'){
                    console.warn('Skipping message with unsupported contentType:', contentType);
                    channel.ack(msg);
                    return;
                }
                let payload;
                try{
                    payload = JSON.parse(msg.content.toString());
                    const {email} = payload || {};
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
                    console.error('Failed to parse message JSON. Acknowledging and dropping message.', err);
                    channel.ack(msg);
                    return;
                }
            }
            catch(error){
                const headers = msg.properties.headers || {};
                const retries = Number(headers['x-retries'] || 0);
                if(retries < MAX_RETRIES){
                    try{
                        const pubChannel = await getChannel("otp_email_confirm_publisher", {confirm: true});
                        const newHeaders = {...headers, 'x-retries': retries + 1};
                        const published = pubChannel.publish(EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.OPT_CONFIRMATION, Buffer.from(msg.content), {persistent: true, contentType: "application/json", headers: newHeaders});
                    }catch(err){
                        console.error('Failed to re-publish message. Dropping.', err);
                    }
                }else{
                    console.error('Max retries exceeded. Dropping message.', { headers, retries });
                }
            }
        }
    )
}

export {startotpEmailConfirmConsumer};