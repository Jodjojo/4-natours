const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies

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
  this.populate({
    path: 'tour',
    select: '-guides  name', //to remove some fields from displaying
  }).populate({
    path: 'user',
    select: ' name photo', //to remove some fields from displaying
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
