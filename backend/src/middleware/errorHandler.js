function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error",
    details: process.env.NODE_ENV === "production" ? undefined : String(err),
  });
}

module.exports = { notFound, errorHandler };
