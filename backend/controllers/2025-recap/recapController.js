import Letter from "../../models/letters.model.js";
import admin from "../../db/firebase.js";

const get2025Recap = async (req, res) => {
    try {
        const year = 2025;
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        //console.log("Fetching 2025 recap for user:", req.user);
        const userId = req.user.uid;
        const userRecord = await admin.auth().getUser(userId);
        //console.log("User record:", userId, userRecord);
        const stats = await Letter.aggregate([
            { $match: { userId, createdAt: { $gte: startOfYear, $lt: endOfYear } } },
            {
                $facet: {
                    totals:[
                        {
                            $group: {
                                _id: null,
                                totalLetters: { $sum: 1 },
                                publishedLetters: {
                                $sum: {
                                    $cond: [
                                    {
                                        $and: [
                                        { $ne: ["$publicId", ""] },
                                        { $ne: ["$publicId", null] },
                                        { $eq: ["$isPublic", true] }
                                        ]
                                    },
                                    1,
                                    0
                                    ]
                                }
                                },  
                                totalViews: { $sum: "$impressions" },
                                firstLetterDate: { $min: "$createdAt" },
                                lastActiveDate: { $max: "$updatedAt" }
                        }
                    }
                    ],
                    mostViewed: [
                        { $match: { isPublic: true } },
                        { $sort: { impressions: -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                title: 1,
                                impressions: 1,
                                publicId: 1
                            }
                        }
                    ]
                }
            }
        ]);
        const totals = stats[0]?.totals[0] || {};
        const mostViewed = stats[0]?.mostViewed[0] || null;
        console.log("Recap stats:", { totals, mostViewed });

        const recap = {
            user: {
                name: userRecord.displayName || "Anonymous",
                email: userRecord.email,
                photo: userRecord.photoURL
            },
            writing: {
                totalLetters: totals.totalLetters || 0,
                publicLetters: totals.publishedLetters || 0
            },
            impact: {
                totalViews: totals.totalViews || 0,
                mostViewedLetter: mostViewed
                ? {
                    title: mostViewed.title,
                    views: mostViewed.impressions,
                    link: `https://rtex.vercel.app/public/${mostViewed.publicId}`
                    }
                : null
            },
            activity: {
                firstLetterDate: totals.firstLetterDate,
                lastActiveDate: totals.lastActiveDate
            }
        }
        return res.status(200).json(recap);

    }
    catch (error) {
        console.error("Error fetching 2025 recap:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { get2025Recap };