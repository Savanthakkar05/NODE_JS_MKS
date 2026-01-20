const sequelize = require("../config/db");

const db_auth = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connnected");
  } catch (error) {
    console.error("Unable to connect DB ", error.message);
  }
};

module.exports = db_auth;
