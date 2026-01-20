// const asyncHandler = (fn) => {
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res)).catch((err) => next(err));
//   };
// };

// module.exports = asyncHandler;


const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await (fn(req, res)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
