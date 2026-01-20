import { Sequelize } from "sequelize";
import dotnev from "dotenv";
dotnev.config();

console.log(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

export default sequelize;
