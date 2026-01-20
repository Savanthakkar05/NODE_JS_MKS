"use strict";

const { QueryTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      "SELECT id,firstname FROM users",
      {
        type: QueryTypes.SELECT,
      }
    );
    console.log("==> ", users[0].id);
    await queryInterface.bulkInsert("profiles", [
      {
        name: users[0].name,
        title: "XYZ",
        user_id: users[0].id,
      },
      {
        name: users[1].name,
        title: "ABC",
        user_id: users[1].id,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profiles", null, {});
  },
};
