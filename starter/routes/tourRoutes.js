const express = require(`express`);
const tourController = require(`./../controllers/tourController`);
const authController = require(`./../controllers/authController`);
const reviewRouter = require(`./../routes/reviewRoutes`);

// 2. ROUTE HANDLERS

const Router = express.Router(); //declaring mounter variable

// POST /tour/1234231/reviews  - sample of creating a new review linked to an array
// GET /tour/12edffs/reviews
// GET /tour/123sfsf/reviews/12331

// Nested Routes with Express
Router.use('/:tourId/reviews', reviewRouter);

// // PARAM MIDDLEWARE
// Router.param('id', tourController.checkID);

Router.route('/top-5-cheap').get(
  tourController.aliasTopTours,
  tourController.getAllTours
);

Router.route('/tour-stats').get(tourController.getTourStats); //Route for aggregate

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
