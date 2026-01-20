"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Product.hasMany(models.CartItem, {
        foreignKey: "productId",
        as: "cartItem",
      });
    }
  }
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING },
      price: { type: DataTypes.INTEGER, allowNull: false },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      images: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      thumbnail: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
