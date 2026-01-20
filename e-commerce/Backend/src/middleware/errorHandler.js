const dotenv = require("dotenv");
dotenv.config();
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const success = err.success;
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: success || false,
    statusCode: statusCode,
    message: message,
    errors: errors,
    stack: process.env.NODE_ENV ? err.stack : undefined,
  });
};

module.exports = errorHandler;
