const errorHandler = (err, req, res, next) => {
  // Log the full error to the console for debugging
  console.error('[Error]:', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  // Send a generic response to the client
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
