const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let hasWarnedDevSecret = false;
let cachedDevSecret = null;

const getJwtSecret = () => {
  const configured = typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : '';
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production.');
  }

  if (!hasWarnedDevSecret) {
    hasWarnedDevSecret = true;
    console.warn('JWT_SECRET is not set; using a derived development secret.');
  }

  if (!cachedDevSecret) {
    cachedDevSecret = crypto
      .createHash('sha256')
      .update(process.env.DB_NAME || 'digital-twin-dev-secret')
      .digest('hex');
  }

  return cachedDevSecret;
};

const signEditToken = ({ twinId, resumeId, publicSlug }) => {
  if (!twinId || !publicSlug) {
    throw new Error('twinId and publicSlug are required to sign an edit token.');
  }

  return jwt.sign(
    {
      twinId,
      resumeId,
      publicSlug,
      scope: 'twin:edit',
    },
    getJwtSecret(),
    {
      expiresIn: '30d',
      algorithm: 'HS256',
    }
  );
};

const verifyEditToken = (token) => {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

  if (
    !decoded ||
    typeof decoded !== 'object' ||
    decoded.scope !== 'twin:edit' ||
    !decoded.twinId ||
    !decoded.publicSlug
  ) {
    throw new Error('Invalid edit token claims.');
  }

  return decoded;
};

module.exports = {
  signEditToken,
  verifyEditToken,
};
