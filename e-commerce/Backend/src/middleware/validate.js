const { validationResult } = require("express-validator");
const ApiError = require("../utlils/ApiError");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const errorMesssage = errors
      .array()
      .map((err) => err.msg)
      .join(", ");

    next(new ApiError(errorMesssage, 400));
  };
};

module.exports = validate;
