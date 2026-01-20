import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import User from "./model/user.model.js";
dotenv.config();

const app = express();

(async () => {
  // console.log('sdd')
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
    await sequelize.sync({ alter: true });

    // Using build
    // const user = User.build({
    //   name: "savan",
    //   email: "savan@sgmail.com",
    //   password: "asdas",
    // });

    // await user.save();

    // Using create

    const user = await User.create({
      name: "savan11",
      email: "savasssn@sgwmsail.com",
      password: "asdas",
      age : 12
    });

    user.increment('age' , {by : 5})
    // user.name = 'sav

    // await user.update({name : 'savan12'})

    // await user.destroy();
  } catch (error) {
    console.error("Unable to connect to database : ", error);
  }
})();

app.listen(process.env.PORT, () => {
  console.log(`Server is listen on ${process.env.PORT}`);
});
