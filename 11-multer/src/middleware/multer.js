const multer = require("multer");
const path = require("path");
const fs = require("fs");

const destination = path.resolve(__dirname, "../../upload");

if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
}

// console.log(destination);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + "-" + file.originalname;
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("==> ", file);
  const allwedType = ["image/jpg", "image/png"];
  if (allwedType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg and png allow image"));
  }
};

const upload = multer({
  storage,
  // fileFilter,
  limits: 5 * 1024 * 1024, // 5mb
});
module.exports = upload;
