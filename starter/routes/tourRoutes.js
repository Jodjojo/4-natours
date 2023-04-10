const express = require(`express`);
const tourController = require(`./../controllers/tourController`);

// 2. ROUTE HANDLERS

const Router = express.Router(); //declaring mounter variable

// // PARAM MIDDLEWARE
// Router.param('id', tourController.checkID);

Router.route('/top-5-cheap').get(
  tourController.aliasTopTours,
  tourController.getAllTours
);

Router.route('/tour-stats').get(tourController.getTourStats); //Route for aggregate

Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

Router.route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = Router;
