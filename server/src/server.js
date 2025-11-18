import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { ensureAdminSeed } from "./config/seedAdmin.js";
import { configureCloudinary } from "./utils/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import errorHandler from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment mode
console.log(`🚀 Starting server in ${process.env.NODE_ENV || 'development'} mode`);

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  const __envPath = path.resolve(__dirname, "../.env");
  const envResult = dotenv.config({ path: __envPath, override: true });
  if (envResult.error) {
    console.error('❌ Failed to load .env file:', envResult.error);
    process.exit(1);
  }
  console.log(`✓ Loaded .env from: ${__envPath}`);
}

console.log(`✓ Cloudinary env check: CLOUD_NAME=${process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING'}, API_KEY=${process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING'}, API_SECRET=${process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'}`);

const app = express();
// Support comma-separated origins, default both 3000 (CRA) and 5173 (Vite)
const corsList = (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow tools and same-origin
      if (corsList.includes("*") || corsList.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database and start server
(async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🔄 Seeding admin user...');
    await ensureAdminSeed();
    
    console.log('🔄 Configuring Cloudinary...');
    configureCloudinary();
    
    console.log('🔄 Starting Express server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('✅ SERVER IS RUNNING!');
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`📊 MongoDB: ${process.env.MONGO_URI.includes('mongodb.net') ? 'Atlas Cloud' : 'Local'}`);
      console.log(`🔐 Admin Login: admin@shophub.com / admin123`);
      console.log('');
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, closing server...');
      server.close(() => process.exit(0));
    });
    process.on('SIGINT', () => {
      console.log('SIGINT received, closing server...');
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});
