const cron = require("node-cron");
const { User } = require("../models");
const { Op } = require("sequelize");

const cleanupResetTokens = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await User.update(
        {
          resetTokenHash: null,
          resetTokenExpires: null,
        },
        {
          where: {
            resetTokenExpires: {
              [Op.lt]: Date.now(),
            },
          },
        }
      );

      console.log(
        `[CRON] Expired reset tokens cleaned at ${new Date().toISOString()}`
      );
      console.log(`[CRON] Rows affected: ${result[0]}`);
    } catch (error) {
      console.error("[CRON] Error cleaning reset tokens:", error);
    }
  });
};

module.exports = cleanupResetTokens;
