import { generateAIText } from "../services/aiService.js";

const generateAIResponse = async (req, res) => {
    try {
        const { text } = req.body;
        const generatedText = await generateAIText(text);
        res.json({ aiText: generatedText });
    } catch (error) {
        console.error("❌ AI API Error:", error);
        res.status(500).json({ error: "AI generation failed." });
    }
};

export { generateAIResponse };
