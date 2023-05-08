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

Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

// Route for Geospatial Queries: Finding tours within a given radius
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin
); //route to find tours within a set :DISTANCE using the :LATITUDE AND LONGITUDE of your location and setting unit of paramters imputted using :UNIT
// /tours-within//233/center/-40,45/unit/mi

// ROute from Geospatial Aggregation: Calculating distances
Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
