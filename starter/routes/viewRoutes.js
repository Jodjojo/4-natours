const express = require(`express`);
const viewsController = require(`../controllers/viewsController`);
const authController = require(`../controllers/authController`);
const bookingController = require(`../controllers/bookingController`);
const router = express.Router();

// we are adding the create booking middleware to the "/" because that is our success route router...so that is what will be called after a successful checkout
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/signup', authController.isLoggedIn, viewsController.getSignUpForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
