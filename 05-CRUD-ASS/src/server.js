const express = require("express");
const dotenv = require("dotenv");
const connect = require("./config/db");
const userRoute = require("./routes/user.route");
dotenv.config();

const app = express();
app.use(express.json());
(async () => {
  try {
    await connect.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("Unable to connect DB : ", error.message);
  }
})();

app.use("/api", userRoute);
app.listen(process.env.PORT, () => {
  console.log("Server run");
});
