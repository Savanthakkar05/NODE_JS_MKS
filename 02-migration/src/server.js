import express from "express";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import sequelize from "./config/db.js";
dotenv.config();

const app = express();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    // Create :
    // const user = User.create({
    //   name: "savan",
    //   password: "savan",
    //   email: "sa@g.com",
    // });

    // Read :
    const userList = await User.findOne({name : 'savan'});
    console.log("==> ", userList.dataValues);

    // Update :
    // await User.update(
    //   {
    //     name: "darshan",
    //   },
    //   {
    //     where: {
    //       email: "sa@g.com",
    //     },
    //   }
    // );

    // Delete
    // await User.destroy({ where: { name: "darshan" } });
  } catch (error) {
    console.error("Unable to connect");
    // process.exit(1);
  }
})();
app.listen(process.env.PORT, () => {
  console.log("Server is run on ");
});
