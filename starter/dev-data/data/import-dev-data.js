const fs = require('fs');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') });

mongoose.set('strictQuery', false);
// eslint-disable-next-line import/no-useless-path-segments
const Tour = require(`./../../models/tourmodel`);
const Review = require(`./../../models/reviewModel`);
const User = require(`./../../models/userModel`);

const DB = process.env.DATABASE;

// eslint-disable-next-line no-use-before-define
dbConnect().catch((err) => console.log(err));
async function dbConnect() {
  await mongoose.connect(DB);
}
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection succesful'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
// eslint-disable-next-line no-unused-vars
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); //to turn off validators before we import to our DB
    await Review.create(reviews);
    console.log('Data Succesfully Loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELET ALL DATA FROM COLLECTION\
// eslint-disable-next-line no-unused-vars
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Succesfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);

//  TO DELETE THE CURRENT DATA IN FOLDER RUN THIS COMMAND
// C:\Users\JODJOJO\Desktop\NODE JS\complete-node-bootcamp-master\4-natours\starter\dev-data\data> (directory where this file is contained)

// node ./import-dev-data.js --delete
// node ./import-dev-data.js --import
