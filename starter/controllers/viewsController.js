const Tour = require(`../models/tourmodel`);
const User = require(`../models/userModel`);
const catchAsync = require(`../utils/catchAsync`);
const AppError = require(`../utils/appError`);

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1.) Get tour data from collection
  const tours = await Tour.find();
  // 2.) Build template

  // 3.) Render template using tour data from step 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  }); //overview is the pug template we want to render on this url
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1.) get the data, for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }
  // 2.) Build the template

  // 3.) Render template using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  }); //base is the name of the filer we want to render
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: `Log into your account`,
    });
});

exports.getSignUpForm = async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('signup', {
      title: `Create New Account`,
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your account`,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: `Your account`,
    user: updatedUser,
  });
});
