const errorHandler = (err, req, res, next) => {
  console.error(`[Global Error]: ${err.message}`);

  // Set status code to 500 if it's currently 200 (default)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    // Hide the stack trace in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };

