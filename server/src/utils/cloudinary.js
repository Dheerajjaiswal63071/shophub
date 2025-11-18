import { v2 as cloudinary } from "cloudinary";

const required = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export function configureCloudinary() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing Cloudinary env vars: ${missing.join(", ")}. Add them to server/.env`
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  if (process.env.NODE_ENV !== 'production') {
    // Lightweight debug to confirm configuration without leaking secrets
    console.log(`Cloudinary configured (cloud_name=${process.env.CLOUDINARY_CLOUD_NAME})`);
  }
}

export default cloudinary;
