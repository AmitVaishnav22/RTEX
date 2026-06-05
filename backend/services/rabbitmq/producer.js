import { getChannel } from "./connection.js";

import {EXCHANGES,ROUTING_KEYS} from "./queues.js";

async function publishEmailOTP({email,otp}){
    try{
        const channel=await getChannel("otp-email-infra", {confirm: true});
        const payload = {
            email,
            otp,
            created_at: new Date().toISOString()
        }
        await channel.publish(EXCHANGES.AUTH, ROUTING_KEYS.OTP_ROUTING_KEY.OTP_EMAIL, Buffer.from(JSON.stringify(payload)), {persistent: true,contentType: "application/json"});
        console.log(`Published OTP email message for ${email}`);
    }catch(error){
        console.error('Failed to publish OTP email message:', error);
        throw error;
    }
}

async function publishSubscriptionConfirmed({email}){
    try{
        const channel=await getChannel("subscription-confirmation-infra", {confirm: true});
        const payload = {
            email,
            confirmed_at: new Date().toISOString()
        }
        await channel.publish(EXCHANGES.SUBSCRIPTION, ROUTING_KEYS.SUBSCRIPTION_ROUTING_KEY.SUBSCRIPTION_CONFIRMATION, Buffer.from(JSON.stringify(payload)), {persistent: true,contentType: "application/json"});
        console.log(`Published subscription confirmation message for ${email}`);
    }catch(error){
        console.error('Failed to publish subscription confirmation message:', error);
        throw error;
    }
}

async function publishWeeklyDigest({email}){
    try{
        const channel=await getChannel("weekly-digest-infra", {confirm: true});
        const payload = {
            email,
            sent_at: new Date().toISOString()
        }
        await channel.publish(EXCHANGES.WEEKLY_DIGEST, ROUTING_KEYS.WEEKLY_DIGEST_ROUTING_KEY.WEEKLY_DIGEST, Buffer.from(JSON.stringify(payload)), {persistent: true,contentType: "application/json"});
        console.log(`Published weekly digest message for ${email}`);
    }catch(error){
        console.error('Failed to publish weekly digest message:', error);
        throw error;
    }
}

export { publishEmailOTP, publishSubscriptionConfirmed, publishWeeklyDigest };