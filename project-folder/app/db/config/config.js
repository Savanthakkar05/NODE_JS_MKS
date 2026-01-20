require("dotenv").config();

const config = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Base_Project",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    seederStorage: "sequelize",
    seederStorageTableName: "sequelizeData",
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    seederStorage: "sequelize",
    seederStorageTableName: "sequelizeData",
    logging: false,
  },
};

module.exports = config;
