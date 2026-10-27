require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-1.5-flash',
];

// Fast Chat Model: Best for fast, low-latency recruiter chat replies
const fastChatModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
});

// Pro Reasoning Model: Best for complex resume analysis or deep STAR method generation
const proReasoningModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
});

// Ultra Fast Model: Best for ultra-fast, simple tasks like extracting keywords
const ultraFastModel = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
});

// Resilient multi-model generator with automatic fallback
const generateWithFallback = async (prompt) => {
  let lastError = null;
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
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

module.exports = {
  fastChatModel,
  proReasoningModel,
  ultraFastModel,
  generateWithFallback,
  genAI,
};
