// eslint-disable-next-line import/no-extraneous-dependencies
const Stripe = require('stripe');
const Tour = require('../models/tourmodel');

const catchAsync = require(`./../utils/catchAsync`);
// const AppError = require(`./../utils/appError`);
// const factory = require(`./handlerFactory`);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY); //calling the stripe library using our Stripe secret API key from our Stripe account
  ///////////////////////////////////
  // 1.) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  //////////////////////////////
  // 2.) Create checkout session

  // we use the Stripe library to create an object that will handle details of the tour we are paying for and call it in the session
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //need to be live images/ hosted on the internet...will be replaced when we host our site
  });

  // we use the Stripe library to create an object that will handle details of the pricing of the payment and call it in the session
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100, //multiplied by 100 because the price of the tour is expected to be in cents
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    // information about the session
    payment_method_types: ['card'], //type of payment method
    success_url: `${req.protocol}://${req.get('host')}/`, //url that will be called or redirected as soon as the payment is succesful
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //redirected url if the user decides to cancel the payment
    customer_email: req.user.email,
    client_reference_id: req.params.tourID, //allows us pass some data about the session we are creating:||when we want to create a new booking based on payment recieved
    mode: 'payment',
    line_items: [
      //details about the payment we just executed
      {
        price: price.id,
        quantity: 1,
      },
    ],
  });
  //////////////////////////
  // 3.) Send back to client
  res.status(200).json({
    status: 'success',
    session,
  });
});
