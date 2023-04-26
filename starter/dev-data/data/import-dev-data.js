const fs = require('fs');
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') });

mongoose.set('strictQuery', false);
// eslint-disable-next-line import/no-useless-path-segments
const Tour = require('./../../models/tourmodel');

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

// IMPORT DATA INTO DB
// eslint-disable-next-line no-unused-vars
const importData = async () => {
  try {
    await Tour.create(tours);
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
