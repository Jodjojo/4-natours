const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

// eslint-disable-next-line node/no-unpublished-require, import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  //object of schema properties
  name: {
    type: String,
    required: [true, 'Please tell us your name'], //
  },
  photo: {
    // uploading the default image as the user icon for each new user
    type: String,
    default: `default.jpg`,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
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
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Query middleware to delete a deleted user from appearing on database
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }); //all documents where active is not equal to false
  next();
});

// encryption of passwords middleware
userSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //hash the password with coast of 12
  this.password = await bcrypt.hash(this.password, 12); //12- coast - level of encryption protection
  // delete the pasword confirm field into the database
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method --- to return the encypted password back to english for processing login details
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// instance method to check if user chnaged password during protection of routes
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //time the reset token will wait before it expires

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
