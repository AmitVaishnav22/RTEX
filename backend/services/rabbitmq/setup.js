import {setupOtpEmailInfrastructure, setupSubscriptionConfirmationInfrastructure} from "./infra/queues.infra.js";

async function setupRabbitMQ(){
    await setupOtpEmailInfrastructure();
    await setupSubscriptionConfirmationInfrastructure();
    console.log('RabbitMQ setup completed');
}

export {setupRabbitMQ};