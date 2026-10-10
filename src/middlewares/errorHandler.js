/**
 * Middleware untuk menangani request ke endpoint yang tidak ditemukan (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan`
  });
};

/**
 * Global error handler middleware (500 atau custom error)
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack, details: err })
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
