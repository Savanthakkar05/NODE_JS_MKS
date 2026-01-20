const db = require("../../app/db/models");
const { status } = require("./messages/api.response");
var generator = require("generate-password");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const errorStackParser = require("error-stack-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
// const s3Client = require('./s3-client');
const { logger } = require("./logger");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");
const { validationResult } = require("express-validator");
const { default: axios } = require("axios");

module.exports = {
  /**
   *
   * @param {*} ms milliseconds to wait for.
   * @returns
   */
  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },
  getUserIP(req) {
    var clientIP = req.ip || req.socket.remoteAddress;
    return clientIP.includes("::ffff:")
      ? clientIP.split("::ffff:")[1]
      : clientIP;
  },
  expressValidate(req, res, next) {
    const errors = validationResult(req);
    let errorSort = errors.array({
      onlyFirstError: true,
    });

    if (!errors.isEmpty()) {
      let error = errorSort[0];
      return res
        .status(status.BadRequest)
        .json({ message: error?.msg, fields: errorSort });
    }
    next();
  },

  expressBulkValidate(req, res, next) {
    const errors = validationResult(req);
    const errorList = errors.array();

    if (!errors.isEmpty()) {
      const groupedErrors = {};

      errorList.forEach((error) => {
        const indexMatch = error.param.match(/\[(\d+)\]/); // Extract index from dataToUpdate[i]
        const index = indexMatch ? indexMatch[1] : null; // Get the index or null

        if (index !== null) {
          if (!groupedErrors[index]) {
            groupedErrors[index] = {
              messages: [],
              params: [],
            };
          }
          groupedErrors[index].messages.push(error.msg);
          groupedErrors[index].params.push(error.param);
        }
      });

      const responseErrors = Object.keys(groupedErrors).map((key) => ({
        SrNo: parseInt(key, 10) + 1,
        messages: groupedErrors[key].messages.join(", "), // Join messages with a comma
        params: groupedErrors[key].params,
      }));

      return res.status(status.BadRequest).json({
        message: "Validation errors occurred.",
        fields: responseErrors,
      });
    }
    next();
  },

  expressBulkUpdateValidate(req, res, next) {
    const errors = validationResult(req);
    const errorList = errors.array();

    if (!errors.isEmpty()) {
      const groupedErrors = {};

      errorList.forEach((error) => {
        const indexMatch = error.param.match(/\[(\d+)\]/); // Extract index from dataToUpdate[i]
        const index = indexMatch ? indexMatch[1] : null; // Get the index or null

        if (index !== null) {
          if (!groupedErrors[index]) {
            groupedErrors[index] = {
              messages: [],
              params: [],
            };
          }
          groupedErrors[index].messages.push(error.msg);
          groupedErrors[index].params.push(error.param);
        } else {
          // Handle top-level errors
          if (!groupedErrors["topLevel"]) {
            groupedErrors["topLevel"] = {
              messages: [],
              params: [],
            };
          }
          groupedErrors["topLevel"].messages.push(error.msg);
          groupedErrors["topLevel"].params.push(error.param);
        }
      });

      const responseErrors = Object.keys(groupedErrors).map((key) => {
        if (key === "topLevel") {
          return {
            messages: groupedErrors[key].messages.join(", "), // Join top-level messages
            params: groupedErrors[key].params,
          };
        } else {
          return {
            SrNo: parseInt(key, 10) + 1,
            messages: groupedErrors[key].messages.join(", "), // Join messages with a comma
            params: groupedErrors[key].params,
          };
        }
      });

      return res.status(status.BadRequest).json({
        message: "Validation errors occurred.",
        fields: responseErrors,
      });
    }
    next();
  },

  async addDaysSetHours(
    days,
    date = new Date(),
    hours = null,
    minutes = null,
    seconds = null
  ) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    if (hours != null) result.setHours(hours);
    if (minutes != null) result.setHours(hours, minutes);
    if (seconds != null) result.setHours(hours, minutes, seconds);
    return result;
  },

  async getDate() {
    let d = new Date();
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    return d;
  },

  /**
   *
   * @param {*} error Error Object.
   * @param {*} APIName - API/Function name where error occurred - will be used if REQ is not available.
   * @param {*} req Request Object (optional).
   * @param {*} res Response Object (optional).
   * @param {*} customMessage Any custom message to send in API response. (optional)
   * @returns return response to client with message.
   */
  throwException(error, APIName, req = null, res = null, customMessage = null) {
    if (Object.prototype.hasOwnProperty.call(error, "errors")) {
      error.message = error.errors[0].message || error.name;
    }

    if (req) {
      // eslint-disable-next-line no-console
      console.error(
        `Error in ${APIName}, URL: ${req.method} - ${req.url}:`,
        error.message
      );
      logger.error(
        `Error in ${APIName}, URL: ${req.method} - ${req.url}: "${error.message}", User: ${
          req.user ? req.user.firstName + " " + req.user.lastName : "Open API"
        },  IP: ${req.ip} - at ${errorStackParser.parse(error)[0].toString()}`
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(`Error in ${APIName},`, error.message);
      logger.error(
        `Error in ${APIName}, "${error.message}" at ${errorStackParser.parse(error)[0].toString()}`
      );
    }

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Error: ", error);
    }

    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === "development") console.log("Error:", error);

    if (res) {
      return res.status(status.InternalServerError).json({
        message: customMessage
          ? customMessage
          : "Something went wrong, please try again!",
        error: error.message,
      });
    } else {
      return true;
    }
  },

  getParsedUA(ua) {
    // UA parser
    let parser = new UAParser(ua);
    let parserResult = parser.getResult();

    const userAgent = parserResult.ua || null;

    // Client OS
    const os =
      parserResult.os.name && parserResult.os.version
        ? parserResult.os.name + " " + parserResult.os.version
        : null;

    // Client Browser
    const browser =
      parserResult.browser.name && parserResult.browser.version
        ? parserResult.browser.name + "/" + parserResult.browser.version
        : null;

    return { os, browser, userAgent };
  },

  async getPermissionByToken(user) {
    let permissions = [];
    if (user?.Role?.isSystemAdmin) {
      permissions = await db.Module.findAll({
        attributes: [["id", "moduleId"]],
        raw: true,
      });
    } else {
      permissions = await db.Permission.findAll({
        attributes: ["moduleId"],
        where: {
          roleId: user.roleId,
        },
        raw: true,
      });
    }
    const moduleIds = permissions.map((i) => i.moduleId);
    return moduleIds;
  },

  async generateRandomPassword() {
    return generator.generate({
      length: 8,
      numbers: true,
      lowercase: true,
      uppercase: true,
      symbols: true,
      strict: true,
    });
  },

  /**
   *
   * @param {*} email user email on which mail will be sent
   * @param {*} subject subject for email
   * @param {*} message message/html body for email
   * @returns
   */
  async sendEmail(email, subject, message) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MailHost,
        port: process.env.MailPort,
        auth: {
          user: process.env.MailAuthUser,
          pass: process.env.MailAuthPassword,
        },
      });

      const mailOptions = {
        from: process.env.MailAuthEmail,
        to: email,
        subject: subject,
        html: message,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      this.throwException(error, "Common Send Mail Function", null, null, null);
      throw error;
    }
  },

  async getTemplateByName(name) {
    var html = fs.readFileSync(
      path.join(__dirname, "../templates/html/", name),
      "utf8"
    );
    const template = handlebars.compile(JSON.parse(JSON.stringify(html)));

    return template;
  },

  convertJsonData(value) {
    try {
      let data = JSON.parse(value);
      if (data) {
        return data;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  },
  /**
   *
   * @param {*} req request object
   * @param {*} field field to get
   * @returns file path from multer
   */
  // getFileFromReq(req, field) {
  //   if (req.files && req.files[field] && req.files[field].length !== 0) {
  //     // return req.files[field][0].path;
  //     return {
  //       key: req.files[field][0].key,
  //       acl: req.files[field][0].acl,
  //       location: req.files[field][0].location,
  //       // bucket: req.files[field][0].bucket,
  //     };
  //   }
  //   return null;
  // },

  // getFileFromReq(req, field) {
  //   if (req.files && req.files[field] && req.files[field].length > 0) {
  //     return {
  //       filename: req.files[field][0].filename, // stored filename
  //       path: req.files[field][0].path, // local path
  //       mimetype: req.files[field][0].mimetype, // file type
  //       size: req.files[field][0].size, // file size
  //     };
  //   }
  //   return null;
  // },

  //  getFileFromReq(req, fieldName) {
  //   if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
  //     const filePath = req.files[fieldName][0].path.replace(/\\/g, "/"); // normalize slashes

  //     // base URL from request
  //     const baseUrl = `${req.protocol}://${req.get("host")}`;

  //     // return object with both path + url if you want
  //     return {
  //       path: filePath, // relative path (good for DB storage if needed)
  //       url: `${baseUrl}/${filePath}` // full URL for frontend
  //     };
  //   }else if(req.file && req.file[fieldName] && req.file[fieldName]){
  //     const filePath = req.file[fieldName].path.replace(/\\/g, "/"); // normalize slashes

  //     // base URL from request
  //     const baseUrl = `${req.protocol}://${req.get("host")}`;

  //     // return object with both path + url if you want
  //     return {
  //       path: filePath, // relative path (good for DB storage if needed)
  //       url: `${baseUrl}/${filePath}` // full URL for frontend
  //     };
  //   }
  //   return null;
  // },

  getFileFromReq(req, fieldName) {
    let file;

    // Check for multiple files (req.files[fieldName])
    if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
      file = req.files[fieldName][0];
    }
    // Check for single file (req.file)
    else if (
      req.file &&
      (req.file.fieldname === fieldName || fieldName === undefined)
    ) {
      file = req.file;
    }

    if (!file) return null;

    // Normalize slashes for cross-platform compatibility
    const filePath = file.path.replace(/\\/g, "/");

    // Construct full URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return {
      path: filePath, // relative path for DB storage
      url: `${baseUrl}/${filePath}`, // full URL for frontend
    };
  },

  getFileObjFromReq(req, field = null) {
    if (req?.file) {
      return {
        key: req.file.key,
        acl: req.file.acl,
        location: req.file.location,
        bucket: req.file.bucket,
      };
    }
    return null;
  },

  /**
   * only using this to send file object which can be handled by Eduwity frontend.
   * @param {*} req request object
   * @param {*} field field to get
   * @returns file object from multer with additional fields
   */
  getFileFromReqForEduwity(req, field) {
    if (req.files && req.files[field] && req.files[field].length !== 0) {
      return {
        index: req.files[field].length,
        encoding: req.files[field][0].encoding,
        originalFileName: req.files[field][0].originalname,
        fileName: req.files[field][0].originalname,
        fileUrl: req.files[field][0].location,
        fileurl: req.files[field][0].location,
        extension: req.files[field][0].mimetype.split("/")[1],
      };
    }
    return null;
  },

  // checking if multer throws any error
  multerMiddleware(err, req, res, next) {
    if (err) {
      if (err instanceof multer.MulterError) {
        let errorMessage = "File upload error!";
        if (err?.code == "LIMIT_UNEXPECTED_FILE") {
          errorMessage = `${err?.message} ${err?.field}`;
        }
        if (err?.code == "LIMIT_FILE_SIZE") {
          errorMessage = `Maximum file size allowed exceeded for ${err?.field}`;
        }

        return res.status(status.BadRequest).json({ message: errorMessage });
      } else {
        return res
          .status(status.BadRequest)
          .json({ message: err.message || "File format not allowed." });
      }
    }
    // if (req.fileValidationError) {
    //     return res.status(status.BadRequest).json({ message: err.message || 'File upload failure.' });
    // }
    next();
  },
  // createMulterUpload(destination, allowedTypes = [], limit = null) {
  //     const year = new Date().getFullYear();
  //     const month = ('0' + (new Date().getMonth() + 1)).slice(-2);
  //     const multerConfig = {
  //         // storage: multer.diskStorage({
  //         //     destination: `${destination}/${year}/${month}`,
  //         //     filename: function (req, file, cb) {
  //         //         cb(null, Date.now() + '-' + file.originalname);
  //         //     },
  //         // }),
  //         // storage: multerS3({
  //         //     s3: s3Client,
  //         //     bucket: process.env.S3_BUCKET, // Change to your actual space name
  //         //     // acl: 'public-read',
  //         //     metadata: (req, file, cb) => {
  //         //         cb(null, { fieldname: file.fieldname });
  //         //     },
  //         //     key: (req, file, cb) => {
  //         //         const fileName = `${process.env.S3_FOLDER}/${destination}/${year}/${month}/${Date.now()}_${file.fieldname}_${String(
  //         //             file.originalname
  //         //         ).replace(/\s+/g, '_')}`;
  //         //         cb(null, fileName);
  //         //     },
  //         // }),
  //         fileFilter: function (req, file, cb) {
  //             if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
  //                 cb(null, true);
  //             } else {
  //                 req.fileValidationError = true;
  //                 cb(new Error(`${file.mimetype} File format not allowed.`), false);
  //                 // cb(null, false, req.fileValidationError);
  //             }
  //         },
  //     };

  //     if (limit !== null && !isNaN(limit)) {
  //         multerConfig.limits = {
  //             fileSize: limit * 1024 * 1024, // Convert limit to bytes
  //         };
  //     }
  //     return multer(multerConfig);
  // },

  createMulterUpload(destination, allowedTypes = [], limit = null) {
    const year = new Date().getFullYear();
    const month = ("0" + (new Date().getMonth() + 1)).slice(-2);

    // Create the folder if it doesn't exist
    const fullPath = path.join(
      destination,
      "profile_images",
      `${year}`,
      `${month}`
    );
    fs.mkdirSync(fullPath, { recursive: true });

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, fullPath);
      },
      filename: function (req, file, cb) {
        const safeName = String(file.originalname).replace(/\s+/g, "_"); // replace spaces with underscores
        cb(null, `${Date.now()}_${safeName}`);
      },
    });

    const multerConfig = {
      storage: storage,
      fileFilter: function (req, file, cb) {
        if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          req.fileValidationError = true;
          cb(new Error(`${file.mimetype} file format not allowed.`), false);
        }
      },
    };

    if (limit !== null && !isNaN(limit)) {
      multerConfig.limits = {
        fileSize: limit * 1024 * 1024, // MB to bytes
      };
    }

    return multer(multerConfig);
  },
  /**
   *
   * @param {*} req request object
   * @param {*} fields array of fields { field: "name of field", message: "message when file is missing." }
   * @returns array of missing files with message.
   */
  async checkFilesInRequest(req, fields = []) {
    if (!Array.isArray(fields)) throw new Error("Fields must be a array.");

    const missingFiles = [];

    for (const field of fields) {
      if (
        !req.files ||
        !req.files[field.name] ||
        req.files[field.name].length === 0
      ) {
        missingFiles.push({
          msg: field.message,
          path: field.name,
        });
      }
    }
    return missingFiles;
  },

  /**
   * Function to generate HMAC Digest
   * @param {*} data - string to generate digest from.
   * @param {*} PrivateKey - Key for encryption
   */
  generateHmacDigest(data, PrivateKey) {
    const hmac = crypto.createHmac("sha256", PrivateKey);
    hmac.update(data);
    return hmac.digest("hex").toString();
  },

  /**
   *
   * @param {*} data - string data to digest
   * @param {*} expectedSignature - req.headers[config.SignatureKey]
   * @param {*} PrivateKey - Shared Key between Eduwity and ThirdParty, config.PrivateKey
   */
  verifyHmacDigest(data, expectedSignature, PrivateKey) {
    // Generate digest using data
    const generatedDigest = this.generateHmacDigest(data, PrivateKey);

    if (expectedSignature === generatedDigest) {
      return true;
    }
    return false;
  },

  /**
   *
   * @description return date&Time in UTC format as per required with addon/deduction as param.
   */
  async getUTCDateComponents({
    dateObj,
    addMinutes = 0,
    subtractMinutes = 0,
    addHours = 0,
    addDays = 0,
  }) {
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      throw new Error("Invalid Date object");
    }
    // Apply the time adjustments
    dateObj.setUTCMinutes(dateObj.getUTCMinutes() + Number(addMinutes));
    dateObj.setUTCHours(dateObj.getUTCHours() + Number(addHours));
    dateObj.setUTCDate(dateObj.getUTCDate() + Number(addDays));
    dateObj.setUTCMinutes(dateObj.getUTCMinutes() - Number(subtractMinutes));

    const pad = (number) => number.toString().padStart(2, "0");

    const year = dateObj.getUTCFullYear();
    const month = pad(dateObj.getUTCMonth() + 1); // Months are zero-indexed
    const date = pad(dateObj.getUTCDate());
    const hours = pad(dateObj.getUTCHours());
    const minutes = pad(dateObj.getUTCMinutes());
    const seconds = pad(dateObj.getUTCSeconds());

    const utcDate = `${year}-${month}-${date}`;
    const utcTime = `${hours}:${minutes}:${seconds}`;
    const utcTimeWithoutSecond = `${hours}:${minutes}`;
    const utcDateTime = `${utcDate}T${utcTime}Z`;
    const utcDateTimeWithoutSecond = `${utcDate}T${utcTimeWithoutSecond}Z`;

    return {
      dateObj,
      utcDate,
      utcTime,
      utcDateTime,
      utcTimeWithoutSecond,
      utcDateTimeWithoutSecond,
    };
  },
  /**
   * Common function to make API requests using axios.
   * @param {string} url - The API endpoint.
   * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.).
   * @param {Object} [data={}] - Data to be sent with POST/PUT requests.
   * @param {Object} [params={}] - Query parameters for GET requests.
   * @param {Object} [headers={}] - Optional headers for the request.
   * @returns {Object} - The response data or error.
   */
  async axiosRequest({
    url,
    method = "GET",
    data = {},
    params = {},
    headers = {},
  }) {
    try {
      const response = await axios({
        url,
        method,
        data,
        params,
        headers,
      });

      return { status: status.OK, data: response.data };
    } catch (error) {
      const defaultMessage =
        error.message ||
        "Some error occurred while waiting for response from server.";
      if (error?.response) {
        return {
          status: status.BadRequest,
          data: error.response.data,
          message: defaultMessage,
        };
      }
      return {
        status: status.InternalServerError,
        message: defaultMessage,
      };
    }
  },

  async getJsonConfig(configPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(configPath, "utf8", (error, data) => {
        if (error) {
          if (error && error.code === "ENOENT") {
            return resolve({ status: status.NotFound });
          } else {
            return reject(error);
          }
        }
        return resolve({ status: status.OK, data: JSON.parse(data) });
      });
    });
  },

  // myBulkUpdate: async function (dataToUpdate, modelName, referenceField, transaction) {
  //     let ids = dataToUpdate.map((m1) => `'${m1[referenceField]}'`);
  //     let singleFields = 'SET ';

  //     let keys = Object.keys(dataToUpdate[0]).filter((f1) => f1 != referenceField);

  //     keys.forEach((element, index) => {
  //         singleFields = singleFields + ` ${element} = CASE `;
  //         dataToUpdate.map((m1) => {
  //             let myValue;

  //             if (m1[element]) {
  //                 myValue = `'${m1[element]}'`;
  //             } else {
  //                 myValue = null;
  //             }

  //             // console.log("m1[element]", m1[element]);
  //             singleFields = singleFields + `WHEN ${referenceField} = '${m1[referenceField]}' THEN ${myValue} `;
  //         });

  //         singleFields = singleFields + `ELSE ${element} END`;

  //         index != keys.length - 1 ? (singleFields = singleFields + ', ') : '';
  //     });

  //     const [results, metadata] = await db.sequelize.query(
  //         `UPDATE ${modelName.tableName}
  //             ${singleFields}
  //             WHERE
  //             Id IN(${ids});
  //         `,
  //         {
  //             type: db.sequelize.QueryTypes.UPDATE,
  //             transaction,
  //         }
  //     );

  //     // return { results, metadata };
  //     return { results, metadata };
  // },
};
