import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
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

// Basic security hardening
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
// Request logging (skip noisy test env)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
// Rate limiting (generic) – tune as needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// Support comma-separated origins, default both 3000 (CRA) and 5173 (Vite)
// We support exact origins and wildcard patterns like "https://*.vercel.app"
const corsListRaw = process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173";
const corsList = corsListRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Create matchers from the list; support exact match, wildcard (contains *) and a '*' for allow-all
const corsMatchers = corsList.map((item) => {
  if (item === "*") return { type: "any" };
  if (item.includes("*")) {
    // Escape regex special chars then replace '*' with '.*' to allow wildcard domains
    const escaped = item.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const pat = `^${escaped.replace(/\\\*/g, ".*")}$`;
    return { type: "regex", regex: new RegExp(pat) };
  }
  return { type: "exact", value: item };
});

// Log the cors origins and whether wildcard matching is enabled
console.log(`✓ CORS_ORIGIN configured: ${corsListRaw}`);
console.log(`✓ CORS matchers: ${corsList.map((s) => s).join(', ')}`);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow tools and same-origin (server-to-server or same-origin requests)
      // Allow if any matcher accepts it
      const allowed = corsMatchers.some((m) => {
        if (m.type === "any") return true;
        if (m.type === "exact") return m.value === origin;
        if (m.type === "regex") return m.regex.test(origin);
        return false;
      });
      if (allowed) return cb(null, true);
      // Log rejected origin to make it easy to debug from Render logs
      console.warn(`[CORS] Rejected origin: ${origin} — allowed: ${corsListRaw}`);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
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
    
    if (process.env.ENABLE_ADMIN_SEED === 'true') {
      console.log('🔄 Seeding admin user...');
      await ensureAdminSeed();
    } else {
      console.log('⏭️ Admin seeding disabled (ENABLE_ADMIN_SEED!=true)');
    }
    
    console.log('🔄 Configuring Cloudinary...');
    configureCloudinary();
    
    console.log('🔄 Starting Express server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('✅ SERVER IS RUNNING!');
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`📊 MongoDB: ${process.env.MONGO_URI.includes('mongodb.net') ? 'Atlas Cloud' : 'Local'}`);
      if (process.env.ENABLE_ADMIN_SEED === 'true') {
        console.log(`🔐 Admin seed: ${process.env.ADMIN_SEED_EMAIL || 'admin@shophub.com'} / ${process.env.ADMIN_SEED_PASSWORD || 'admin123'}`);
      }
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
