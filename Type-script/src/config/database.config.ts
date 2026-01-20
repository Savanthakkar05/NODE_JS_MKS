import { Options } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const config: Options = {
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    dialect: "mysql",
};

export default {
    development: config,
    production: config,
    test: config,
};