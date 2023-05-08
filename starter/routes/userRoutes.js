const express = require(`express`);
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');

const userController = require(`./../controllers/userController`);
const authController = require(`./../controllers/authController`);

// Multer upload defines where all the images we upload will be saved
// The "dest" option defines the folder we want all the images that are uploaded to be saved.
// images are not directly uploaded into the DB but to our file system and then we link the name to the DB

const upload = multer({ dest: 'public/img/users' });

const Router = express.Router(); //declaring mounter variable

// users

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect); //to protect all the routes that come from each level after this middleware

Router.patch('/updateMyPassword', authController.updatePassword);

// /ME endpoint using middleware
Router.get('/me', userController.getMe, userController.getUser);

// We then use the upload multer to add to the route for the update using upload.single because it is one file we want to upload.
// 'PHOTO' is the name of the field that is holding the uploaded image in the form
Router.patch('/updateMe', upload.single('photo'), userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);

Router.use(authController.restrictTo('admin'));

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
