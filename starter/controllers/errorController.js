const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Error handling duplicate DB fields
const handleDuplicateFieldsDB = (err) => {
  // console.log(err);to see where the err.keyvalue is coming from

  // const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};
//
// Hnadling mongoose validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1.) log error
    // eslint-disable-next-line no-console
    console.error('ERROR💣💣💣', err);
    // 2.) Send generic message
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: 'There was an error, it is a problem from the server side',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // Seprating error handling in development stage from production stage
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(err); //invalid DB ID
    if (error.code === 11000) error = handleDuplicateFieldsDB(err); //Duplicate DB field
    if (error.name === 'ValidationError') error = handleValidationErrorDB(err); //Mongoose validation error
    sendErrorProd(error, res);
    //sendErrorProd(error, res);
  }
};
