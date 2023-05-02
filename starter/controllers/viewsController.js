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
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    tour: 'The Forest Hiker',
    user: 'Joseph', //locals in the pug file
  }); //base is the name of the filer we want to render
};
