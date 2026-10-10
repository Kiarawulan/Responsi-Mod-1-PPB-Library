const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Terjadi kesalahan pada server' });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
