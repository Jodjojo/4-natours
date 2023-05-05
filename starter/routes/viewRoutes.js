const express = require(`express`);
const viewsController = require(`../controllers/viewsController`);
const authController = require(`../controllers/authController`);
const router = express.Router();

// so on every URL subdirectory we call using the overview domain name the overview template is loaded
router.get('/', authController.isLoggedIn, viewsController.getOverview);
// so on every URL subdirectory we call using the tour domain name the tour template is loaded
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/signup', authController.isLoggedIn, viewsController.getSignUpForm);

router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;
