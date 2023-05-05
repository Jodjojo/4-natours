class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //all errors sent to client are operational errors

    Error.captureStackTrace(this, this.consructor);
  }
}

module.exports = AppError;
