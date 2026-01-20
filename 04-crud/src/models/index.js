'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;















// import fs from "fs";
// import path from "path";
// import Sequelize from "sequelize";
// import { fileURLToPath, pathToFileURL } from "url";
// import configFile from "../config/config.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const env = process.env.NODE_ENV || "development";
// const config = configFile[env];

// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   config
// );

// const db = {};

// async function loadModels() {
//   const files = fs.readdirSync(__dirname).filter(
//     (file) => file !== "index.js" && file.endsWith(".js")
//   );

//   for (const file of files) {
//     const modelPath = pathToFileURL(
//       path.join(__dirname, file)
//     ).href;

//     const module = await import(modelPath);
//     const ModelClass = module.default;

//     // ✅ CALL init(), NOT the constructor
//     const model = ModelClass.initModel(sequelize);
//     db[model.name] = model;
//   }

//   // Associations
//   Object.values(db).forEach((model) => {
//     if (model.associate) {
//       model.associate(db);
//     }
//   });
// }

//  loadModels();

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export default db;



