const notFoundHandler = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = err.message || 'Internal Server Error';

  if (
    err.type === 'entity.parse.failed' ||
    (err instanceof SyntaxError && err.status === 400 && 'body' in err)
  ) {
    statusCode = 400;
    message = 'Invalid JSON request payload.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload exceeds the allowed size limit.';
  } else {
    const candidateStatus =
      err.statusCode ||
      err.status ||
      (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
    statusCode =
      typeof candidateStatus === 'number' && candidateStatus >= 400 && candidateStatus <= 599
        ? candidateStatus
        : 500;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error(`[Global Error] ${statusCode}:`, err.message);
  }

  if (isProduction && statusCode >= 500) {
    message = 'Internal Server Error';
  }

  const payload = {
    success: false,
    message,
    error: message,
  };

  if (!isProduction) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFoundHandler, errorHandler };

