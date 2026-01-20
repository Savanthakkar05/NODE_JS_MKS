const express = require("express");
const dotenv = require("dotenv");
const db_authenticate = require("./config/db.authenticate");
const errorHandler = require("./middleware/errorHandler");
const userRoute = require("./routes/user.route");
const productRoute = require("./routes/product.route");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cleanupResetTokens = require("./utlils/cleanupResetTokens");
const cartRoute = require("./routes/cart.route");
dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.1.191:5173"],
    // origin: ["*"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db_authenticate();

cleanupResetTokens();
app.use(cookieParser());
app.use("/v1/api", userRoute);
app.use("/v1/api/product", productRoute);
app.use("/v1/api/cart", cartRoute);

app.use(errorHandler);
app.listen(process.env.PORT || 3005, () => {
  console.log(`Server is listen on ${process.env.PORT}`);
});
