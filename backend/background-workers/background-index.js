import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConnectToRabbitMQ, closeRabbitMQ } from '../services/rabbitmq/connection.js';
import { setupRabbitMQ } from '../services/rabbitmq/setup.js';
import { startOtpEmailConsumer } from './consumers/otpEmail.consumer.js';
import { startotpEmailConfirmConsumer } from './consumers/otpEmail.confirm.consumer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const RETRY_DELAY_MS = Number(process.env.BACKGROUND_WORKER_RETRY_MS || 5000);
let startupTimer = null;
let shuttingDown = false;

export async function startBackgroundWorkers() {
  try {
    await ConnectToRabbitMQ();
    await setupRabbitMQ();
    await startOtpEmailConsumer();
    await startotpEmailConfirmConsumer();
    console.log('Background workers startedddddd..............', process.env.NODE_ENV);
  } catch (err) {
    if (shuttingDown) return;

    console.error(
      `Failed to start background workers. Retrying in ${RETRY_DELAY_MS}ms.`,
      err
    );
    startupTimer = setTimeout(() => {
           startBackgroundWorkers().catch(err => {
              console.error('Retry failed:', err);
          });
      }, RETRY_DELAY_MS);
  }
}

function shutdown(signal) {
  shuttingDown = true;
  if (startupTimer) {
    clearTimeout(startupTimer);
  }
  console.log(`Received ${signal}. Shutting down background workers...`);
  closeRabbitMQ().finally(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log("Background worker module loaded. Waiting for start signal...", process.env.NODE_ENV);


await startBackgroundWorkers();
