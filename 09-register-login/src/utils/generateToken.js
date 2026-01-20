const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.SECRET_KEY,
    {
      expiresIn: `${process.env.ACCESS_TOKEN_TIME}m`,
    }
  );

  const refreshToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: `${process.env.REFRESH_TOKEN_TIME}d`,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
