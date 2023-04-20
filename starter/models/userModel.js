const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
    validate: {
      validator: function (el) {
        // this only works on CREATE and SAVE!!
        return el === this.password; //to have same password as password confirm
      },
      message: 'Passwords are not the same',
    },
  },
});

// encryption of passwords
userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //hash the password with coast of 12
  this.password = await bcrypt.hash(this.password, 12); //12- coast - level of encryption protection
  // delete the pasword confirm field into the database
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
