const { StatusCodes } = require("http-status-codes");
const uploadCloudinary = require("../utils/cloudinary");
const uploadImage = async (req, res) => {
  try {
    // console.log(req.files);
    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "No file uploaded" });
    }

    // console.log("file : ", req.file);
    const localPath = req.file.path;
    const cloudinary_res = await uploadCloudinary(localPath);
    
    if (!cloudinary_res) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Upload cloudinary to failed" });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "File uploaded successfukk",
      public_id: cloudinary_res.public_id,
      file: req.file?.filename,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

module.exports = uploadImage;
