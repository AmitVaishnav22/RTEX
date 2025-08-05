import axios from "axios";

const generateTitle = async (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid input: text must be a non-empty string.");
    }
    const prompt = " Give a standard short title for this context : ";
    try {
        const response = await axios.post("https://rtex-1.onrender.com/ai/generate", {
        text: text + prompt,
        });
        const aiSuggestion = response.data.suggestion.trim();
        return aiSuggestion;
    } catch (error) {
        console.error("Error generating AI title:", error);
        throw error;
    }
};

const generateContent = async (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Invalid input: text must be a non-empty string.");
    }
    const prompt = " Complete this context by adding more details to it : ";
    try {
        const response = await axios.post("https://rtex-1.onrender.com/ai/generate", {
        text: text + prompt,
        });
        const aiSuggestion = response.data.suggestion.trim();
        return aiSuggestion;
    } catch (error) {
        console.error("Error generating AI content:", error);
        throw error;
    }
};

export { generateContent, generateTitle };
