require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RAW_CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

const FALLBACK_MODELS = [];
const seenModels = new Set();

for (const rawModel of RAW_CANDIDATE_MODELS) {
  if (typeof rawModel !== 'string') continue;
  const trimmed = rawModel.trim();
  if (!trimmed || seenModels.has(trimmed)) continue;
  seenModels.add(trimmed);
  FALLBACK_MODELS.push(trimmed);
}

const RETRYABLE_STATUSES = new Set([404, 429, 500, 502, 503, 504]);
const TRANSIENT_ERROR_CODES = new Set([
  'GEMINI_TIMEOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
]);

const withTimeout = async (promise, timeoutMs, label) => {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const timeoutError = new Error(`Gemini request timed out after ${timeoutMs}ms (${label})`);
      timeoutError.code = 'GEMINI_TIMEOUT';
      timeoutError.status = 504;
      reject(timeoutError);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
};

const isRetryableGeminiError = (err) => {
  if (!err) return false;
  const status = err.status ?? err.statusCode;

  if (status === 400 || status === 401 || status === 403) {
    return false;
  }
  if (RETRYABLE_STATUSES.has(status)) {
    return true;
  }

  const code = err.code || err.cause?.code;
  if (code && TRANSIENT_ERROR_CODES.has(code)) {
    return true;
  }

  const msg = String(err.message || '').toLowerCase();
  if (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('not found')
  ) {
    return true;
  }

  return status === undefined;
};

const sleepJitter = (baseMs = 300) =>
  new Promise((resolve) => {
    const delay = baseMs + Math.floor(Math.random() * 150);
    setTimeout(resolve, delay);
  });

const runWithModelFallback = async (
  { systemInstruction, generationConfig, timeoutMs = 25000, label = 'gemini' },
  invokeModel
) => {
  let lastError = null;

  for (let i = 0; i < FALLBACK_MODELS.length; i += 1) {
    const modelName = FALLBACK_MODELS[i];
    try {
      const modelConfig = { model: modelName };
      if (systemInstruction) {
        modelConfig.systemInstruction = systemInstruction;
      }
      if (generationConfig) {
        modelConfig.generationConfig = generationConfig;
      }
      const model = genAI.getGenerativeModel(modelConfig);
      const result = await withTimeout(
        invokeModel(model, timeoutMs),
        timeoutMs + 1000,
        `${label}:${modelName}`
      );
      return result.response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(
        `Gemini ${label} failed on ${modelName} (${err.status || err.code || err.message})`
      );
      if (!isRetryableGeminiError(err) || i === FALLBACK_MODELS.length - 1) {
        break;
      }
      await sleepJitter();
    }
  }

  throw lastError;
};

const generateWithFallback = (prompt, options = {}) =>
  runWithModelFallback(
    {
      systemInstruction: options.systemInstruction,
      generationConfig: options.generationConfig,
      timeoutMs: options.timeoutMs ?? 25000,
      label: 'generate',
    },
    (model, timeoutMs) => model.generateContent(prompt, { timeout: timeoutMs })
  );

const chatWithFallback = ({
  history = [],
  message,
  systemInstruction,
  generationConfig,
  timeoutMs = 25000,
}) =>
  runWithModelFallback(
    {
      systemInstruction,
      generationConfig,
      timeoutMs,
      label: 'chat',
    },
    (model, requestTimeoutMs) => {
      const chat = model.startChat({ history });
      return chat.sendMessage(message, { timeout: requestTimeoutMs });
    }
  );

module.exports = {
  FALLBACK_MODELS,
  withTimeout,
  isRetryableGeminiError,
  generateWithFallback,
  chatWithFallback,
  genAI,
};
