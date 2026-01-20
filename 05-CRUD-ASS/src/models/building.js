"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Building.belongsToMany(models.User, {
        through: "UserProjects",
        foreignKey: "user_id",
      });
    }
  }
  Building.init(
    {
      buildding_no: {
        type: DataTypes.INTEGER,
      },
      building_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Building",
    }
  );
  return Building;
};
