/* eslint-disable import/no-extraneous-dependencies */
const path = require(`path`);
const express = require(`express`);
// const fs = require
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //rate limiting
const helmet = require('helmet'); //security HTTP Headers
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require(`./utils/appError`);
const globalErrorHandler = require(`./controllers/errorController`);
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const app = express();

// setting up PUG in express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //views is the folder of where we are storing our PUG templates

// GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Setting security HTTP headers
app.use(helmet());
// Development loggin
if (process.env.NODE_ENV === `development`) {
  app.use(morgan(`dev`));
}
// Rate limiting - limiting number of requests per IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //100 requests per hour
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// DATA SANITIZATION against NoSQL query injection(using express-mongo-sanitize )
app.use(mongoSanitize());

// DATA SANITIZATION against XSS(using xss clean)
app.use(xss());

// Prevent Paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Creating our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3. ROUTES MOUNTING
// creating a new route to access the pages from the view template
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Joseph', //locals in the pug file
  }); //base is the name of the filer we want to render
});

app.use('/api/v1/tours', tourRouter); //mounted tour router
app.use('/api/v1/users', userRouter); //mounted user router
app.use('/api/v1/reviews', reviewRouter);

// handling errors with unfound routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);
app.use(express.json());
module.exports = app;
