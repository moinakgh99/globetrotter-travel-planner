const errorHandler = (err, req, res, next) => {
  // Log the full error to the console for debugging
  console.error('[Error]:', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Something went wrong. Please try again later.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
