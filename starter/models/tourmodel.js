const mongoose = require('mongoose');
const slugify = require('slugify');
// SIMPLE TOUR MODEL
const tourSchema = new mongoose.Schema(
  {
    //object of schema properties
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //schema type options
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a dificulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'], //schema type options
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //omitting from output
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //object of schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
}); //Virtual property of duration weeks

// DOCUMENT MIDDLEWARE below runs before the .save() and .create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/*
tourSchema.pre('save', function (next) {
  console.log('will save documents...');
  next();
});
// post host document middleware
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
*/

// QUERY MIDDLEWARE
// For example, having a private and secret tour not appearing on the result output
tourSchema.pre(/^find/, function (next) {
  //^find/=regular expression for any command that contains find it runs the same function
  this.find({ secretTour: { $ne: true } }); //filter out any that contains secretTour as true
  this.start = Date.now();
  next();
});

// POST HOST has access to all the documents in the query
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
// we use the Aggregate hook for this
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //add a new stage in the aggregate to execute the secret tour middleware
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
