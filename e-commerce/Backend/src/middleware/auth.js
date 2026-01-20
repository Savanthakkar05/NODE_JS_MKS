const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utlils/ApiError");
const dotenv = require("dotenv");
dotenv.config();

exports.auth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    // console.log(req.cookies.accessToken);

    if (!token) {
      return next(
        new ApiError("Access Token Required", StatusCodes.UNAUTHORIZED)
      );
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new ApiError(
        `Invalid or expire token ${error.message}`,
        StatusCodes.UNAUTHORIZED
      )
    );
  }
};
