/* eslint-disable arrow-body-style */
// Catching errors in async functions
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
