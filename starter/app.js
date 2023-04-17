const express = require(`express`);
// const fs = require
const morgan = require('morgan');

const AppError = require(`./utils/appError`);
const globalErrorHandler = require(`./controllers/errorController`);
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const app = express();

// MIDDLEWARES

if (process.env.NODE_ENV === `development`) {
  app.use(morgan(`dev`));
}
app.use(express.json());
app.use(express.static(`./starter/public`));
// Creating our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3. ROUTES MOUNTING
app.use('/api/v1/tours', tourRouter); //mounted tour router
app.use('/api/v1/users', userRouter); //mounted user router

// handling errors with unfound routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);
app.use(express.json());
module.exports = app;
