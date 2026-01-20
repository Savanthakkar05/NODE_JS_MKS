const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.lastname} ${this.firstname}`;
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          const hashedPass = bcrypt.hashSync(value, 10);
          this.setDataValue("password", hashedPass);
        },
      },
    },
    {
      timestamps: false,
    }
  );

  User.associate = (models) => {
    // User has one Profile
    User.hasOne(models.Profile, {
      foreignKey: "user_id", // Standardize on one key
      as: "profile",
    });
  };

  return User;
};
