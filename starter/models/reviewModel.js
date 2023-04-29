const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const Tour = require(`./tourmodel`);
// using parent referencing because we dont know how big our array of reviews could grow
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a content'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A review must have a rating between 1 and 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be from a User'],
    },
  },
  {
    //object of schema options to make sure that a field not stored in the DB to show up whenever there is an output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//populating our user
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: '-guides  name', //to remove some fields from displaying
  // }).populate({
  //   path: 'user',
  //   select: ' name photo', //to remove some fields from displaying
  // });

  this.populate({
    path: 'user',
    select: ' name photo', //to remove some fields from displaying
  });

  next();
});

// CALCULATING AVERAGE RATINGS ON TOUR
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour', //criteria field for grouping
        nRating: {
          $sum: 1,
        },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  // check for if stat has any content to set the ratings and rating
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Updating average ratings and Quantity on New Review Creation
reviewSchema.post('save', function () {
  // "this" points to current review
  this.constructor.calcAverageRatings(this.tour);
});

//Updating average ratings and Quantity on New Review Update or/and Delete
reviewSchema.post(/^findOneAnd/, async (docs) => {
  if (docs) await docs.constructor.calcAverageRatings(docs.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
