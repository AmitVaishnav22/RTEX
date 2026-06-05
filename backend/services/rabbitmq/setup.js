import {setupOtpEmailInfrastructure, setupSubscriptionConfirmationInfrastructure,setupWeeklyDigestInfrastructure} from "./infra/queues.infra.js";

async function setupRabbitMQ(){
    await setupOtpEmailInfrastructure();
    await setupSubscriptionConfirmationInfrastructure();
    await setupWeeklyDigestInfrastructure();
    console.log('RabbitMQ setup completed');
}

export {setupRabbitMQ};