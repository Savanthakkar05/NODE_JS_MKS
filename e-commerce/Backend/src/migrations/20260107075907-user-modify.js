"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "resetTokenHash", {
      type: Sequelize.STRING,
    }),
      await queryInterface.addColumn("Users", "resetTokenExpires", {
        type: Sequelize.DATE,
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "resetTokenHash"),
      await queryInterface.removeColumn("Users", "resetTokenExpires");
  },
};
