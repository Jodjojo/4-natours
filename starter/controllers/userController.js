// const fs = require(`fs`);

// const users = JSON.parse(fs.readFileSync('./starter/dev-data/data/users.json'));

/* eslint-disable arrow-body-style */
const User = require('../models/userModel');

const factory = require(`./handlerFactory`);
// eslint-disable-next-line import/no-useless-path-segments

const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  }); //loop through for keynames
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined! Please use /signUp instead`,
  });
};

//  Updating the cuurent user Data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1.) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // Filter out unwanted Field names not allowed to be updated without validators
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 2.) Update User document
  const updatedUser = await User.findById(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// To delete user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
// Do NOT uodate passwords with this
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.getAllUsers = factory.getAll(User);
