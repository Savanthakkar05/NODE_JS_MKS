const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const userRoute = require("./routes/user.route");
dotenv.config();

const app = express();
app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected ");
  } catch (error) {
    console.error(error);
  }
})();

// console.log(process.env);
app.use("/v1/api", userRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is run on the ${process.env.PORT}`);
});
