"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Cart.hasMany(models.CartItem, {
        foreignKey: "cartId",
        as: "cartItem",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Cart.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: "Cart",
    }
  );
  return Cart;
};
