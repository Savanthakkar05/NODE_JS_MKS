const express = require("express");
const upload = require("../middleware/multer");
const uploadImage = require("../controller/user.controller");
const route = express.Router();

// route.post(
//   "/upload",
//   upload.fields([a
//     { name: "profile", maxCount: 1 },
//     { name: "avtar", maxCount: 2 },
//   ]),
//   uploadImage
// );

// route.post("/upload", upload.array("profile", 3), uploadImage);
route.post("/upload", upload.single("profile"), uploadImage);

module.exports = route;
