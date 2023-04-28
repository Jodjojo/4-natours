const express = require(`express`);
const reviewController = require(`./../controllers/reviewController`);
const authController = require(`./../controllers/authController`);

// NESTED ROUTER WITH EXPRESS using merge params
const Router = express.Router({ mergeParams: true }); //declaring mounter variable

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = Router;
