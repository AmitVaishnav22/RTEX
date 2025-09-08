import Letter from "../models/letters.model.js";
import { getCache, setCache } from "../services/redisService.js";


const getAliasForLetter = async (publicId) => {
  const alias = await getCache(`alias:reverse:${publicId}`);
  return alias || null;
};

const getPublicLinks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const skip = (page - 1) * limit;

    const cacheKey = `public:links:page:${page}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const letters = await Letter.find(
      { publicId: { $ne: null } },
      { title: 1, publicId: 1, impressions: 1, size: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enriched = await Promise.all(
      letters.map(async (letter) => {
        const alias = await getAliasForLetter(letter.publicId);

        return {
          title: letter.title,
          impressions: letter.impressions || 0,
          publicId: letter.publicId,
          isPublic: letter.isPublic,
          link: alias
            ? `https://rtex.vercel.app/public/${alias}`
            : `https://rtex.vercel.app/public/${letter.publicId}`,
        };
      })
    );
    const total = await Letter.countDocuments({ publicId: { $ne: null } });
    const totalPages = Math.ceil(total / limit);

    const response = {
      page,
      perPage: limit,
      total,
      totalPages,
      data: enriched,
    };

    await setCache(cacheKey, response, 60); 
    res.json(response);
  } catch (error) {
    console.error("Error fetching public links:", error);
    res.status(500).json({ error: "Failed to fetch public links" });
  }
};

export { getPublicLinks };