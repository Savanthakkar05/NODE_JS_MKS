"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.Orders, {
        foreignKey: "user_id",
        as: "order",
      });
    }
  }
  User.init(
    {
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
