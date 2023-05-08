/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
const multer = require('multer');

const User = require('../models/userModel');

const factory = require(`./handlerFactory`);
// eslint-disable-next-line import/no-useless-path-segments

const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);

// Configuring MULTER
// To configure our multer to our need, we create a multer storage and filter anf then use that to create the upload
const multerStorage = multer.diskStorage({
  // cb is the callback function that works like the "next" parameter
  // the "null" in the cb is the space to declare if there are errors or not and then the path for the destination follows that
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // we give our files some unique file names so there wont be two images with the same filenames
    //we extract the current name from the uploaded file from the mimetype in "req.file"
    const ext = file.mimetype.split('/')[1];
    // cb is used to define errors first = "null" and then the filename we want to define uniquely is the second paramter
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
}); //to store the file in the file system

const multerFilter = (req, file, cb) => {
  // The goal of the multifilter is to check if the uploaded file is an image|| if it is we pass "true" into CB || else we pass "false" and an error
  // it is not limited to testing for images but can also work for filtering all kind of files by making minor chnages to the paramters in this function
  // the file.mimetype.startsWith helps us check if the mimetype of the "req.file" that was uploaded starts with image no matter the extension "jpeg, png, tiff"
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('File is not an Image! Please upload only images', 404),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');

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

// /me endpoint
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//  Updating the cuurent user Data
exports.updateMe = catchAsync(async (req, res, next) => {
  // On postman if we want to update the current logged in user, we do not do it under the "RAW" of the "BODY" but under the "FORM-data" cuz this is how we can send multi-part form data
  // On the "form-data" we use the "key" section to define the name of the filed and the "value" to define the content
  // We can also change the type of key we want (text, file(for photos since we are uploading a file) )
  console.log(req.file);
  console.log(req.body);
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
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
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
