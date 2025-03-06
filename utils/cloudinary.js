const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const allowedFormats = ["png", "pdf", "jpg", "jpeg", "webp"];

    // Get file extension (png or pdf)
    const fileExtension = file.mimetype.split("/")[1];

    if (!allowedFormats.includes(fileExtension)) {
      throw new Error("Invalid file type. Only PNG and PDF are allowed.");
    }

    return {
      folder: "Travel_Hotel_Package/Clients",
      format: fileExtension,
      resource_type: fileExtension === "pdf" ? "raw" : "image", // Store PDFs as 'raw' type
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
