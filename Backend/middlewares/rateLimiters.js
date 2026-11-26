const { rateLimit } = require('express-rate-limit');

const createRateLimitResponse = (message) => ({
  success: false,
  message,
  error: message,
});

const buildLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: createRateLimitResponse(message),
  });

const createTwinLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message:
    'Too many resume uploads from this IP. Please wait a few minutes before creating another Digital Twin.',
});

const chatTwinLimiter = buildLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  message: 'Too many chat messages sent too quickly. Please pause briefly and try again.',
});

const standardReadLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 120,
  message: 'Too many requests. Please slow down and try again shortly.',
});

const updateTwinLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many profile update requests. Please wait a few minutes and try again.',
});

module.exports = {
  createTwinLimiter,
  chatTwinLimiter,
  standardReadLimiter,
  updateTwinLimiter,
};
