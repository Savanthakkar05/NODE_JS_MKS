const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const authenticationToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  try {
    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, message: "Access Token Required" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded.id;
    next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Invalid or expired Acces token" });
  }
};

module.exports = authenticationToken;
