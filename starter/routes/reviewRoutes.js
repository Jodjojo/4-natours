const express = require(`express`);
const reviewController = require(`./../controllers/reviewController`);
const authController = require(`./../controllers/authController`);

const Router = express.Router(); //declaring mounter variable

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = Router;
