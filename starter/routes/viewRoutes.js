const express = require(`express`);
const viewsController = require(`../controllers/viewsController`);
const router = express.Router();

// so on every URL subdirectory we call using the overview domain name the overview template is loaded
router.get('/', viewsController.getOverview);
// so on every URL subdirectory we call using the tour domain name the tour template is loaded
router.get('/tour/:slug', viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

router.get('/signup', viewsController.getSignUpForm);

module.exports = router;
