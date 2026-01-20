const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.generateToken = (user) => {
  accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: `${process.env.EXPIRES_TIME_ACCESS_TOEKN}d` }
  );
  return accessToken;
};
