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

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again.', 401);

//Rendering Error page to each Development and Production error handler
// if URL starts with /api for development error and if it doesnt start with /api then the error will be rendered on the webpage
// req.originalUrl = entire URL without the host so it looks exactly like the route we created
const sendErrorDev = (err, req, res) => {
  //A.) API IN DEVELOPMENT STAGE
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B.) RENDERED WEBSITE IN DEVELOPMENT STAGE
  console.error('ERROR💣💣💣', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  }); //"error" name of the PUG template we are going to create to handle the render
};

const sendErrorProd = (err, req, res) => {
  //A.) API AT PRODUCTION STAGE
  if (req.originalUrl.startsWith('/api')) {
    //a.) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //b.) Programming or other unknown error: don't leak error details
    // 1.) log error
    // eslint-disable-next-line no-console
    console.error('ERROR💣💣💣', err);
    // 2.) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  //B.) RENDERED WEBSITE AT PRODUCTION STAGE
  //a.) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  //b.) Programming or other unknown error: don't leak error details
  // 1.) log error
  // eslint-disable-next-line no-console
  console.error('ERROR💣💣💣', err);
  // 2.) Send generic message
  return res.status(500).json({
    status: 'error',
    msg: 'Something went very wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Seprating error handling in development stage from production stage
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastErrorDB(err); //invalid DB ID
    if (error.code === 11000) error = handleDuplicateFieldsDB(err); //Duplicate DB field
    if (error.name === 'ValidationError') error = handleValidationErrorDB(err); //Mongoose validation error
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
    //sendErrorProd(error, res);
  }
};
