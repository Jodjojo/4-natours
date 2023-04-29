const express = require(`express`);
const reviewController = require(`./../controllers/reviewController`);
const authController = require(`./../controllers/authController`);

// NESTED ROUTER WITH EXPRESS using merge params
const Router = express.Router({ mergeParams: true }); //declaring mounter variable

Router.use(authController.protect);

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

Router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = Router;
