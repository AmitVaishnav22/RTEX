import { publishWeeklyDigest } from "../../services/rabbitmq/producer.js";
import { getChannel } from "../../services/rabbitmq/connection.js";
import { EXCHANGES, ROUTING_KEYS , QUEUES} from "../../services/rabbitmq/queues.js";
import { getWeeklyDigestContent } from "../utils/getWeeklyDigestContent.util.js";
import { sendWeeklyDigestEmail } from "../services/weeklydigetEmail.service.js";

async function startWeeklyDigestConsumer() {
    const channel = await getChannel("weekly-digest-infra", { prefetch: 5 });
    console.log('Weekly Digest consumer started, awaiting messages...');
    const weeklyDigestContent = await getWeeklyDigestContent();
    channel.consume(
        QUEUES.WEEKLY_DIGEST_QUEUE.WEEKLY_DIGEST,
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
                    console.log(`Received weekly digest request for ${email}`);
                    // Here you would integrate with your email service to send the digest
                    // For example: await sendWeeklyDigestEmail(email, weeklyDigestContent);
                    await sendWeeklyDigestEmail(email, weeklyDigestContent);
                    console.log(`Sent weekly digest email to ${email}`);
                    channel.ack(msg);
                }catch(err){
                    const retries = Number(msg.properties.headers['x-retries'] || 0);
                    if(retries >= 3){
                        channel.publish(EXCHANGES.WEEKLY_DIGEST, ROUTING_KEYS.WEEKLY_DIGEST_ROUTING_KEY.WEEKLY_DIGEST_DLQ, Buffer.from(msg.content), {persistent: true, contentType: "application/json", headers: msg.properties.headers});
                        channel.ack(msg);
                        console.error('Max retries exceeded. Moved message to DLQ.', { headers: msg.properties.headers, retries });
                        return;
                    }
                    channel.publish(EXCHANGES.WEEKLY_DIGEST, ROUTING_KEYS.WEEKLY_DIGEST_ROUTING_KEY.WEEKLY_DIGEST_RETRY, Buffer.from(msg.content), {persistent: true, contentType: "application/json", headers: {...msg.properties.headers, 'x-retries': retries + 1}});
                    channel.ack(msg);
                    console.error('Error processing message. Retrying.', err, { headers: msg.properties.headers, retries });
                }
            }catch(err){
                console.error('Unexpected error in consumer:', err);
            }
        })
}

export { startWeeklyDigestConsumer };