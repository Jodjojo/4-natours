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
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require(`./utils/appError`);
const globalErrorHandler = require(`./controllers/errorController`);
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const bookingRouter = require(`./routes/bookingRoutes`);
const viewRouter = require(`./routes/viewRoutes`);
const app = express();

// Trust Proxys
app.enable('trust proxy');

// setting up PUG in express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //views is the folder of where we are storing our PUG templates

// GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Setting security HTTP headers

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com/',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://127.0.0.1:1234/',
  'https://cdnjs.cloudflare.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const frameSrcUrls = ['https://js.stripe.com/'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      frameSrc: [...frameSrcUrls],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // for updating form of user without API
app.use(cookieParser());

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

app.use(compression());

// Creating our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3. ROUTES MOUNTING
app.use('/', viewRouter); //mounted views router
app.use('/api/v1/tours', tourRouter); //mounted tour router
app.use('/api/v1/users', userRouter); //mounted user router
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// handling errors with unfound routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);
app.use(express.json());
module.exports = app;
