const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  //object of schema properties
  name: {
    type: String,
    required: [true, 'Please tell us your name'], //
  },
  photo: String,
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a valid Email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    // Built-in-validators
    message: 'Password must contain more than 8 characters',
    minlength: [8, 'A user password must have more or equal to 10 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
