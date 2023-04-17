/* eslint-disable arrow-body-style */
const Tour = require('../models/tourmodel');
// eslint-disable-next-line import/no-useless-path-segments
const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = require(`./../utils/catchAsync`);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage,summary,difficulty';
  next();
};
// const tours = JSON.parse(
//   fs.readFileSync(`./starter/dev-data/data/tours-simple.json`)
// );

// middleware to be chained

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: `success`,
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id}) //MONGOOSE FORMAT
  res.status(200).json({
    status: `success`,
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: `success`,
    data: {
      tours: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: `success`,
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: `success`,
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //group according to different property field name...$toUpper - change to uppercase
        // _id: '$ratingsAverage',
        numRatings: { $sum: '$ratingsQuantity' }, //number of ratings
        numTours: { $sum: 1 }, //number of tours
        avgRating: { $avg: '$ratingsAverage' }, //calculating average of field(ratingsAverage)
        avgPrice: { $avg: '$price' }, //'$price' name of field with dollar sign
        minPrice: { $min: '$price' }, //calculate minimum price
        maxPrice: { $max: '$price' }, //max Price
      },
    },
    {
      $sort: { avgPrice: 1 }, //sort by ascending average price(1=ascending || -1=descending)
    },
    /*{
      $match: { _id: { $ne: 'EASY' } }, //filter documents that excluding ARE NOT easy || ne=exclude
    },*/
  ]);
  res.status(200).json({
    status: `success`,
    data: {
      stats,
    },
  });
});

// UNWINDING AND PROJECTION(how many tours per month in a year)
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //deconstruct startDates array and create one document per output
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //filter based on tours with start dates after january 2021
          $lte: new Date(`${year}-12-31`), //tours before december 31, 2021
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //separating month from full date
        numTourStarts: { $sum: 1 }, //num tours per month
        tours: { $push: '$name' }, //info on tour name in new array
      },
    },
    {
      $addFields: {
        month: '$_id',
      }, //add new field to store id data
    },
    {
      $project: {
        _id: 0,
      }, //for the id field to not show
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12, //limit number of documents per page
    },
  ]);
  res.status(200).json({
    status: `success`,
    data: {
      plan,
    },
  });
});
