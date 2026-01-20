"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CartItem.belongsTo(models.Cart, {
        foreignKey: "cartId",
        as: "cart",
      });

      CartItem.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  CartItem.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      priceAtAdd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamp: true,
      sequelize,
      modelName: "CartItem",
    }
  );
  return CartItem;
};
