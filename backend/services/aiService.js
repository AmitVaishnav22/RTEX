import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const generateAIText = async (text) => {
  try {
    console.log("🤖 Generating AI text:", text);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Ensure request matches Postman format
    const result = await model.generateContent(text);

    const response = result.response;
    console.log("🔥 Full API Response:", response);

    if (response && response.candidates.length > 0) {
      console.log("✅ Generated Text:", response.candidates[0].output);
      return response.candidates[0].output;
    }

    return "⚠️ AI could not generate text.";
  } catch (error) {
    console.error("❌ AI Generation Error:", error);
    return "AI failed to generate text.";
  }
};

export { generateAIText };
// const genAI = new GoogleGenerativeAI(API_KEY);
// console.log(genAI);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// export const generateAIText = async (text) => {
//   try {
//     console.log("🤖 Generating AI text...", text);

//     // const result = await model.generateContent(text + "\n\nAI, continue writing...");
//     const result = await model.generateContent(text);
//     console.log("🤖 AI Generated Text:", result);

//     const response = result.response;

//     if (response && response.candidates.length > 0) {
//       return response.candidates[0].output;
//     }

//     return "AI could not generate text.";
//   } catch (error) {
//     console.error("❌ AI Generation Error:", error);
//     return "AI failed to generate text.";
//   }
// };
