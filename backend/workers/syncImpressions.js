import Letter from "../models/letters.model.js";
import { getAllImpressionSync, resetImpressionCount,getimpressionCount } from "../services/redisService.js";


const syncImpressions = async (req, res) => {
    //console.log("Starting impression sync...");
    try {
        const keys = await getAllImpressionSync();
        if (!keys.length) {
            console.log("No impressions to sync.");
            return;
        }
        for (const key of keys) {
            const count= await getimpressionCount(key.split(':')[1]);
            const impressions = parseInt(count, 10)|| 0;
            if (impressions > 0) {
                const publicId = key.split(':')[1];
                const letter = await Letter.findOne({ publicId });
                if (letter) {
                    letter.impressions = (letter.impressions || 0) + impressions;
                    await letter.save();
                    //console.log(`Synced ${impressions} impressions for ${publicId}`);
                } else {
                    console.log(`Letter not found for publicId: ${publicId}`);
                }
                await resetImpressionCount(publicId);
            }
        }
        //console.log("Impression sync completed.");
    } catch (error) {
        console.error("Error syncing impressions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { syncImpressions };