const errorHandler = (err, req, res, next) => {
  // Log the full error to the console for debugging
  console.error('[Error]:', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const errorMessage = err.message || 'Something went wrong. Please try again later.';

  res.status(statusCode).json({
    error: errorMessage,
  });
};

module.exports = errorHandler;
