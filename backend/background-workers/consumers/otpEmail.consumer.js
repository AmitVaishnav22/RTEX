import { ConnectToRabbitMQ, getChannel } from '../../services/rabbitmq/connection.js';
import { QUEUES, EXCHANGES, ROUTING_KEYS } from '../../services/rabbitmq/queues.js';
import { sendOtpEmail } from '../services/otpEmail.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_RETRIES = parseInt(process.env.OTP_CONSUMER_MAX_RETRIES || '3', 10);
const PREFETCH = parseInt(process.env.OTP_CONSUMER_PREFETCH || '5', 10);

async function startOtpEmailConsumer() {;
  const channel = await getChannel('otp-email-infra', { prefetch: PREFETCH });

  console.log('OTP Email consumer started, awaiting messages...');

  channel.consume(
    QUEUES.OTP_EMAIL_QUEUE.OTP_EMAIL,
    async (msg) => {
      if (!msg) return;

      try {
        const contentType = msg.properties.contentType || '';
        if (contentType && contentType !== 'application/json') {
          console.warn('Skipping message with unsupported contentType:', contentType);
          channel.ack(msg);
          return;
        }
        try {
          const { email, otp } = JSON.parse(msg.content.toString());
          if (!email || !otp) {
            console.error('Invalid payload: missing email or otp. Acknowledging and dropping.', payload);
            channel.ack(msg);
            return;
          }
          await sendOtpEmail(email, otp);
          channel.ack(msg);
          console.log(`Sent OTP email to ${email}`);
        } catch (sendErr) {
          const headers = msg.properties.headers || {};
          const retries = Number(headers['x-retries'] || 0);
          if (retries >= MAX_RETRIES) {
            channel.publish(EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL_DLQ, Buffer.from(msg.content), { persistent: true, contentType: 'application/json', headers });
            channel.ack(msg);
            console.error(`Max retries reached for ${email}. Moved message to DLQ.`, sendErr);
            return;
          }
          channel.publish(EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL_RETRY, Buffer.from(msg.content), { persistent: true, contentType: 'application/json', headers: { ...headers, 'x-retries': retries + 1 } });
          channel.ack(msg);
          console.error(`Error sending OTP email to ${email}. Retrying.`, sendErr, { retries: retries + 1 });
          }
        }
      catch (err) {
        console.error('Unexpected error in OTP consumer:', err);
      }
    });
}


export { startOtpEmailConsumer };

// const isDirectRun = process.argv[1]
//   ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
//   : false;

// if (process.env.NODE_ENV !== 'test' && isDirectRun) {
//   startOtpEmailConsumer().catch((err) => {
//     console.error('OTP consumer failed to start', err);
//     process.exit(1);
//   });
// }
