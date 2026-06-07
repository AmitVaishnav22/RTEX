import { publishWeeklyDigest } from "../services/rabbitmq/producer.js";
import Subscription from "../models/subscription.model.js";
import {getCache, setCache} from "../services/redisService.js";

async function sendWeeklyDigest(){
    try{
        const subscribers = await Subscription.find({ verified : true }).select("email").lean();
        for (const subscriber of subscribers) {
            await publishWeeklyDigest({ email: subscriber.email });
        }
        console.log(`Weekly digest sent to ${subscribers.length} subscribers.`);
    }
    catch(error){
        console.error("Error sending weekly digest:", error);
    }
}

async function runWeeklyDigestServiceIfNeeded(email){
    const today = new Date();
    if (today.getDay()!==0) {
        return;
    }
    const alreadySent = await getCache("weekly_digest_sent");
    if (alreadySent) {
        console.log("Weekly digest already sent today. Skipping...");
        return;
    }
    await sendWeeklyDigest();
    await setCache("weekly_digest_sent", "true", 24 * 60 * 60 * 7);
    console.log("Weekly digest sent and cache updated.");
}


export { sendWeeklyDigest, runWeeklyDigestServiceIfNeeded };