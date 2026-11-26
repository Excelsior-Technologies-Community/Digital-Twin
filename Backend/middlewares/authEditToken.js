const { verifyEditToken } = require('../utils/editToken');

const sendUnauthorized = (res, message) =>
  res.status(401).json({
    success: false,
    message,
    error: message,
  });

const requireEditToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string') {
    return sendUnauthorized(res, 'Edit authorization token is required.');
  }

  const match = /^Bearer\s+([^\s]+)$/i.exec(authHeader.trim());
  if (!match || !match[1]) {
    return sendUnauthorized(res, 'Edit authorization token is required.');
  }

  try {
    req.editAuth = verifyEditToken(match[1]);
    return next();
  } catch (err) {
    if (err.message === 'JWT_SECRET environment variable is required in production.') {
      return next(err);
    }
    return sendUnauthorized(res, 'Invalid or expired edit token.');
  }
};

module.exports = {
  requireEditToken,
};
