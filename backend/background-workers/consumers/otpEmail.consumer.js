import { ConnectToRabbitMQ, getChannel } from '../../services/rabbitmq/connection.js';
import { QUEUES, EXCHANGES, ROUTING_KEYS } from '../../services/rabbitmq/queues.js';
import { sendOtpEmail } from '../services/otpEmail.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const MAX_RETRIES = parseInt(process.env.OTP_CONSUMER_MAX_RETRIES || '3', 10);
const PREFETCH = parseInt(process.env.OTP_CONSUMER_PREFETCH || '5', 10);

async function startOtpEmailConsumer() {;
  const channel = await getChannel('otp_email_consumer', { prefetch: PREFETCH });

  await channel.assertExchange(EXCHANGES.AUTH, 'direct', { durable: true });
  await channel.assertQueue(QUEUES.OTP_EMAIL, { durable: true });
  await channel.bindQueue(QUEUES.OTP_EMAIL, EXCHANGES.AUTH, ROUTING_KEYS.OTP_EMAIL);

  console.log('OTP Email consumer started, awaiting messages...');

  channel.consume(
    QUEUES.OTP_EMAIL,
    async (msg) => {
      if (!msg) return;

      try {
        const contentType = msg.properties.contentType || '';
        if (contentType && contentType !== 'application/json') {
          console.warn('Skipping message with unsupported contentType:', contentType);
          channel.ack(msg);
          return;
        }

        let payload;
        try {
          payload = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error('Failed to parse message JSON. Acknowledging and dropping message.', err);
          channel.ack(msg);
          return;
        }

        const { email, otp } = payload || {};
        if (!email || !otp) {
          console.error('Invalid payload: missing email or otp. Acknowledging and dropping.', payload);
          channel.ack(msg);
          return;
        }

        try {
          await sendOtpEmail(email, otp);
          channel.ack(msg);
          console.log(`Sent OTP email to ${email}`);
        } catch (sendErr) {
          const headers = msg.properties.headers || {};
          const retries = Number(headers['x-retries'] || 0);

          if (retries < MAX_RETRIES) {
            try {
              const pubChannel = await getChannel('otp_email_publisher', { confirm: true });
              const newHeaders = { ...headers, 'x-retries': retries + 1 };
              const published = pubChannel.publish(
                EXCHANGES.AUTH,
                ROUTING_KEYS.OTP_EMAIL,
                Buffer.from(JSON.stringify(payload)),
                { persistent: true, contentType: 'application/json', headers: newHeaders }
              );

              if (published) {
                console.warn(`Republished message for ${email} (retry ${retries + 1}). Acking original.`);
                channel.ack(msg);
              } else {
                console.error('Publish returned false. Nacking original message to requeue.');
                channel.nack(msg, false, true);
              }
            } catch (pubErr) {
              console.error('Failed to republish message; requeueing original message.', pubErr);
              try {
                channel.nack(msg, false, true);
              } catch (nackErr) {
                console.error('Failed to nack message after publish failure. Acking to avoid infinite loop.', nackErr);
                channel.ack(msg);
              }
            }
          } else {
            console.error(`Max retries reached for ${email}. Dropping message.`, sendErr);
            channel.ack(msg);
          }
        }
      } catch (err) {
        console.error('Unexpected consumer error. Nacking to requeue.', err);
        try {
          channel.nack(msg, false, true);
        } catch (nackErr) {
          console.error('Failed to nack message after unexpected error. Acking as fallback.', nackErr);
          channel.ack(msg);
        }
      }
    },
    { noAck: false }
  );
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
