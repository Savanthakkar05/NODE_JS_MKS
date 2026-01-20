const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
exports.sendingMail = async (email, subject, html) => {
  const transport = nodemailer.createTransport({
    host: process.env.HOST_NAME,
    port: process.env.PORT1,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.PASSWORD,
    },
  });

  const info = await transport.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: html,
  });

  return info;
};
