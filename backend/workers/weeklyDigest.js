import { publishWeeklyDigest } from "../services/rabbitmq/producer.js";
import Subscription from "../models/subscription.model.js";

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

export { sendWeeklyDigest };