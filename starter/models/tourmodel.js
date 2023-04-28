const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');
// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
const User = require('./userModel');
// const validator = require('validator');
// SIMPLE TOUR MODEL
const tourSchema = new mongoose.Schema(
  {
    //object of schema properties
    name: {
      type: String,
      // Data validators: Built-in
      required: [true, 'A tour must have a name'], //schema type options...all data types
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'], //for strings
      minlength: [10, 'A tour name must have more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], //custom...if name is all characters/alphabets
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
      // Built-in-validators
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      }, //to restrict a value to certain defaults...only for strings
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // Built in validators
      min: [1, 'Rating number must be above 1.0'], //for numbers and dates
      max: [5, 'Rating number must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'], //schema type options
    },
    priceDiscount: {
      type: Number,
      validate: {
        //custom validation...if we want to validate if the discount price is higher than original tour price
        validator: function (val) {
          //this only points to current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount Price ({VALUE}) should be below regular price',
      },
    },
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
    startLocation: {
      // GeoJSON - special MongoDB data format used to specify geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //longititude x latitude (different from normal coordinates structure)
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, //embedding modeling tour guides
    guides: [
      //modeling tour guides using child referencing
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

// middleware to convert ID of guide to information of the guides (embedding)
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// QUERY MIDDLEWARE
// For example, having a private and secret tour not appearing on the result output
tourSchema.pre(/^find/, function (next) {
  //^find/=regular expression for any command that contains find it runs the same function
  this.find({ secretTour: { $ne: true } }); //filter out any that contains secretTour as true
  this.start = Date.now();
  next();
});

// population query middleware...using a query middleware solves the problem of repeating the code in multiple different places
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //to remove some fields from displaying
  }); //populating tour guides(filling referenced fields with actual data)
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
