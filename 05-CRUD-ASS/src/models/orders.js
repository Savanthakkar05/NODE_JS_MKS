"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Orders.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "customer",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Orders.init(
    {
      productName: DataTypes.STRING,
      username: DataTypes.STRING,
      address: DataTypes.STRING,
      number: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Orders",
    }
  );
  return Orders;
};
