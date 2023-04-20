// const fs = require(`fs`);

// const users = JSON.parse(fs.readFileSync('./starter/dev-data/data/users.json'));

/* eslint-disable arrow-body-style */
const User = require('../models/userModel');
// eslint-disable-next-line import/no-useless-path-segments

const catchAsync = require(`./../utils/catchAsync`);

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: `success`,
    results: users.length,
    data: {
      users,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined!`,
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined!`,
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined!`,
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: `This route is not yet defined!`,
  });
};
