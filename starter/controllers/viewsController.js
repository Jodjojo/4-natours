const Tour = require(`../models/tourmodel`);
const catchAsync = require(`../utils/catchAsync`);

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

exports.getTour = catchAsync(async (req, res) => {
  // 1.) get the data, for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // 2.) Build the template

  // 3.) Render template using data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  }); //base is the name of the filer we want to render
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: `Log into your account`,
  });
});

exports.getSignUpForm = async (req, res) => {
  res.status(200).render('signup', {
    title: `Create New Account`,
  });
};
