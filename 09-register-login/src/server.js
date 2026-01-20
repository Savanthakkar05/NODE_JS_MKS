const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const db_auth = require("./utils/db_auth");
const authRoute = require("./routes/auth.route");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/v1/auth", authRoute);
db_auth();
app.listen(process.env.PORT, () => {
  console.log(`Server is run on the ${process.env.PORT}`);
});
