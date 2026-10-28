require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

// Fast Chat Model: Best for fast, low-latency recruiter chat replies
const fastChatModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
});

// Pro Reasoning Model: Best for complex resume analysis or deep STAR method generation
const proReasoningModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

// Ultra Fast Model: Best for ultra-fast, simple tasks like extracting keywords
const ultraFastModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-8b',
});

// Resilient multi-model generator with automatic fallback
const generateWithFallback = async (prompt, systemInstruction) => {
  let lastError = null;
  for (const modelName of FALLBACK_MODELS) {
    try {
      const modelConfig = { model: modelName };
      if (systemInstruction) {
        modelConfig.systemInstruction = systemInstruction;
      }
      const model = genAI.getGenerativeModel(modelConfig);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(
        `Model ${modelName} unavailable (${err.status || err.message}), attempting fallback...`
      );
      lastError = err;
    }
  }
  throw lastError;
};

// Resilient multi-model multi-turn chat with automatic fallback
const chatWithFallback = async (prompt, systemInstruction, formattedHistory = []) => {
  let lastError = null;
  for (const modelName of FALLBACK_MODELS) {
    try {
      const modelConfig = { model: modelName };
      if (systemInstruction) {
        modelConfig.systemInstruction = systemInstruction;
      }
      const model = genAI.getGenerativeModel(modelConfig);
      const chat = model.startChat({
        history: formattedHistory,
      });
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(
        `Model ${modelName} unavailable in chat (${err.status || err.message}), attempting fallback...`
      );
      lastError = err;
    }
  }
  throw lastError;
};

module.exports = {
  fastChatModel,
  proReasoningModel,
  ultraFastModel,
  generateWithFallback,
  chatWithFallback,
  genAI,
};
