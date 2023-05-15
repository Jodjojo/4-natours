/* eslint-disable no-console */
const mongoose = require('mongoose');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
//Catching uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log(`UNCAUGHT EXCEPTION!💣 Shutting down`);
  process.exit(1); //0 = success || 1 = uncaught exceptions
});
// const dotenv = require(`dotenv`);
// dotenv.config({ path: './starter/.env' });
const app = require(`./app`);

mongoose.set('strictQuery', false);

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

// SERVER
const port = process.env.PORT || 3000; //port number
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //server listening

// console.log(process.env);

// Handling Unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`UNHANDLED REJECTION!💣 Shutting down`);
  server.close(() => {
    process.exit(1); //0 = success || 1 = uncaught exceptions
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECIEVED, Shutting down gracefully!⚡');
  server.close(() => {
    console.log('🚨Process terminated');
  });
});
