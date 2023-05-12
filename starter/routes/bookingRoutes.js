const express = require(`express`);
const bookingController = require(`./../controllers/bookingController`);
const authController = require(`./../controllers/authController`);

// NESTED ROUTER WITH EXPRESS using merge params
const Router = express.Router();

Router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = Router;
