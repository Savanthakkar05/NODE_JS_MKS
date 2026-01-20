const sequelize = require("./db");

const db_authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
  } catch (error) {
    console.error("Unable to connect DB due to error ", error.message);
    process.exit(1);
  }
};

module.exports = db_authenticate;