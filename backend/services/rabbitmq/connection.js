import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const channels={};
let connection=null;
let connecting=null;

// establish connection to RabbitMQ

async function ConnectToRabbitMQ() {
    if (connection){
        console.log('Already connected to RabbitMQ');
        return connection;
    }
    if (connecting){
        return connecting;
    }
    connecting=(async()=>{
        try {
            connection = await amqp.connect(RABBITMQ_URL,{heartbeat:30});
            console.log('Connected to RabbitMQ');

            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
            });

            connection.on('close',()=>{
                console.error('RabbitMQ connection closed. Attempting to reconnect...');
                connection=null;
                connecting=null;
                for (const key in channels){
                    delete channels[key];
                }
                setTimeout(()=>{ ConnectToRabbitMQ(); },5000);
            })
            return connection;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            connection=null;
            connecting=null;
            setTimeout(()=>{ ConnectToRabbitMQ(); },5000);
            throw error;
        }
    })();
    return connecting;
}

// get a channel for a specific queue
async function getChannel(name="default",options={}){
    if (channels[name]){
        return channels[name];
    }
    if (!connection){
        await ConnectToRabbitMQ();
    }
    const {confirm = false, prefetch = null} = options;

    const channel = confirm ? await connection.createConfirmChannel() : await connection.createChannel();

    if (prefetch){
        channel.prefetch(prefetch);
    }
    channels[name]=channel;
    console.log(`Channel created for queue: ${name}`);

    channel.on('error', (err) => {
        console.error(`Channel error for queue ${name}:`, err);
    });

    channel.on('close', () => {
        console.error(`Channel closed for queue ${name}. Removing from cache.`);
        delete channels[name];
    });

    if (name !== "default"){
        console.log(`Channel for ${name} is ready`);
    }

    return channel;
}

async function closeRabbitMQ(){
    try {
        for (const key in channels){
            await channels[key].close();
            delete channels[key];
        }
        if (connection){
            await connection.close();
            connection=null;
        }
        console.log('RabbitMQ connection closed gracefully');
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error);
    }
}

export { ConnectToRabbitMQ, getChannel, closeRabbitMQ };