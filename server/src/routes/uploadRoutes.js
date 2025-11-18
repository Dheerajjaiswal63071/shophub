import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary, { configureCloudinary } from "../utils/cloudinary.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/uploads/image
router.post(
  "/image",
  protect,
  admin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      configureCloudinary();

      const folder = process.env.CLOUDINARY_FOLDER || "ecommerce-products";

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "image" },
          (error, data) => (error ? reject(error) : resolve(data))
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      return res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      console.error("Cloudinary upload failed:", err?.message || err);
      return res.status(500).json({
        message: err?.message || "Cloudinary upload failed",
        code: err?.http_code || err?.name || undefined,
      });
    }
  }
);

export default router;
