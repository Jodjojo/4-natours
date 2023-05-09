/* eslint-disable arrow-body-style */
const multer = require('multer');

const sharp = require('sharp');
const Tour = require('../models/tourmodel');
// eslint-disable-next-line import/no-useless-path-segments
// const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = require(`./../utils/catchAsync`);

const AppError = require(`./../utils/appError`);
const factory = require(`./handlerFactory`);

// UPLOADING MULTIPLE IMAGES WITH MULTER: TOURS
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1.)Cover Image
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) //3:2 for the photos
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  req.body.imageCover = imageCoverFilename;

  // 2.) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

////////////////////////////////////////////
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

// FACTORY HANDLES
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
/*
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  //Adding 404 Not Found errors
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: `success`,
    data: null,
  });
});
*/

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

// /tours-within//233/center/-40,45/unit/mi

// GEOSPATIAL QUERIES: FINDING TOURS WITHIN RADIUS
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //to get the radius we are going to use we divide the distance by the radius of the earth in miles or km as it seems to convert to RADIANS

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and logitude in the format lat,lng',
        400
      )
    );
  }

  // TO GET TOUR BASED ON FINDING THE STARTLOCATION(as defined in each tour)
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //filter of the startLocation parameter
  }); //in GEO JSON the longitude has to be defined first before the latitude which is the opposite of what it normally is.
  // We use the geoWithin Operator to get the location using the center sphere operator and lat and long x radius

  res.status(200).json({
    status: 'Sucess',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// GEOSPATIAL AGGREGATION: To calculate the distance of all tours from a particular location
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and logitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        }, //point from which to calculate the distances
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      }, //geospatial aggregate to solve it and must always be first stage in the pipeline
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Sucess',
    data: {
      data: distances,
    },
  });
});
