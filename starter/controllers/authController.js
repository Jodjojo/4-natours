const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const User = require(`./../models/userModel`);

const catchAsync = require(`./../utils/catchAsync`);

const AppError = require(`./../utils/appError`);

const signToken = function (id) {
  // eslint-disable-next-line no-undef
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}; //jwt.sign(payload(or header), secret, expiresin) === to create the signature we use to check the jwt
// Signing up user and automatically logging in on sign up

exports.signup = catchAsync(async (req, res, _next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    //201 - created status
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// logging in a user on username, email and password basis
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and passwords exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // 2.) check if user exists and passsword is correct
  const user = await User.findOne({ email }).select('+password'); //the +password is to select a field that is normally not selected for display in DB

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); //401-unautorized status code
  }
  // 3.) if everything is okay, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// Protecting the routes - only logged in users have access to all the routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1.) Getting token and check if it is exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //format for token check using headers key(authorization) and value(starter with 'Bearer token') in postman for JWT

  if (!token) {
    return next(
      new AppError(
        'You are not currently logged in! Please log in to get access.',
        401
      )
    );
  }
  // 2.) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.)  Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token does no longer exist', 401)
    );
  }
  // 4.) check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please Login again!', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
