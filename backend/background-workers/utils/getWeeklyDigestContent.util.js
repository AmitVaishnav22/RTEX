import Letter from "../../models/letters.model.js";
async function getWeeklyDigestContent() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let letters = await Letter.find({
        isPublic: true,
        createdAt: { $gte: oneWeekAgo },
        $or: [
            { passcode: null },
            { passcode: "" },
            { passcode: { $exists: false } }
        ]
    })
    .sort({
        impressions: -1
    })
    .limit(3)
    .select(
        "title content publicId authorName authorPhoto authorEmail createdAt impressions"
    )
    .lean();

    if (letters.length < 3) {
        const remaining = 3 - letters.length;

        const existingIds = letters.map(letter => letter._id);

        const fallbackLetters = await Letter.find({
            isPublic: true,
            _id: { $nin: existingIds },
            $or: [
                { passcode: null },
                { passcode: "" },
                { passcode: { $exists: false } }
            ]
        })
        .sort({
            impressions: -1
        })
        .limit(remaining)
        .select(
            "title content publicId authorName authorPhoto authorEmail createdAt impressions"
        )
        .lean();

        letters = [...letters, ...fallbackLetters];
        letters = letters.map(letter => ({
                                            ...letter,
                                            preview:
                                                letter.content
                                                    ?.replace(/<[^>]*>/g, "") 
                                                    .replace(/\s+/g, " ")
                                                    .trim()
                                                    .slice(0, 100) + "..."
                                        }));
    }

    return letters;
}

function formPublicLink(publicId) {
    return `https://rtex.vercel.app/public/${publicId}`;
}
export { getWeeklyDigestContent, formPublicLink };