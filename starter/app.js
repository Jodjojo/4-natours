const express = require(`express`);
// const fs = require
const morgan = require('morgan');

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
  console.log(`Hello from the middleware💣⚡`);
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3. ROUTES MOUNTING
app.use('/api/v1/tours', tourRouter); //mounted tour router
app.use('/api/v1/users', userRouter); //mounted user router

module.exports = app;
