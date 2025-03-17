import axios from "axios";

const aiContent = async (req, res) => {
  const { text } = req.body;
  console.log(text);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is missing in environment variables!");
    return res.status(500).json({ error: "Server misconfiguration: Missing API Key" });
  }
  
  console.log("Using API Key: Key Found");
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  try {
    const response = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: text + " Complete this sentence only single suggestion:" }] }],
      },
      {
        params: { key: apiKey },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const aiSuggestion = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No suggestion generated.";
    res.json({ suggestion: aiSuggestion });
  } catch (error) {
    console.error("AI Generation Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to generate AI suggestion." });
  }
};

export { aiContent };
