const auth = require("../../middlewares/middleware");
const controller = require("./lib/controller");
const router = require("express").Router();
const { expressValidate } = require("../../../utils/lib/common-function");
const {
  validationRules,
  loginRules,
  updateRules,
  updatePassword,
  updateProfileRules,
  passwordRules,
} = require("./lib/validation");
const {
  createMulterUpload,
  multerMiddleware,
} = require("../../../utils/lib/common-function");

// allowed types for multer
const allowedType = ["image/png", "image/jpeg", "image/jpg"];

const files = [
  {
    name: "profileImage",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
];

const uploads = createMulterUpload("uploads", allowedType, 10); //limit 10MB

// get all User
router.post("/users", auth, controller.findAll);

// get User by Id
router.get("/user/:id", auth, controller.findById);

// create User
router.post(
  "/user",
  auth,
  uploads.fields(files),
  multerMiddleware,
  validationRules(),
  expressValidate,
  controller.create,
);

// login
router.post("/login", loginRules(), expressValidate, controller.login);

// forgot password
router.post(
  "/user/forgot-password",
  passwordRules(),
  expressValidate,
  controller.forgotPassword,
);

// update User
router.put(
  "/user/:id",
  auth,
  uploads.fields(files),
  multerMiddleware,
  updateRules(),
  expressValidate,
  controller.update,
);

// update User status
router.put("/user/status/:id", auth, controller.updateStatus);

// delete User
router.delete("/user/:id", auth, controller.delete);

// Find Latest Audit Log Entries
router.get("/user-activity", auth, controller.findLatestEntries);

/** PROFILE APIS */

// get User by token
router.get("/token", auth, controller.verifyToken);

// Update cover image or profile image
router.put(
  "/update-image/:id",
  uploads.fields(files),
  multerMiddleware,
  controller.updateImage,
);

// find user by token
router.get("/profile", auth, controller.findByToken);

// update Profile
router.put(
  "/profile",
  auth,
  uploads.single("profileImage"),
  multerMiddleware,
  updateProfileRules(),
  expressValidate,
  controller.updateProfile,
);

// update Profile
router.put("/profile/remove-image", auth, controller.removeProfileImage);

// update User password
router.put(
  "/profile/change-password",
  auth,
  updatePassword(),
  expressValidate,
  controller.updatePassword,
);

// get User by token
router.get("/user-count", auth, controller.getAllUserCount);

// get all User-Session
router.get("/userSessions", auth, controller.getAllUserSession);

// delete User-Session
router.post("/userSession", auth, controller.deleteUserSession);

// delete All-User-Session
router.delete("/userSessions", auth, controller.deleteAllUserSession);

module.exports = router;
