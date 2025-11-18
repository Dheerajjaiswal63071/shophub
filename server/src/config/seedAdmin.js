import User from "../models/User.js";

// Seeds an admin user based on environment flags.
// In production it requires ENABLE_ADMIN_SEED=true and an ADMIN_SEED_PASSWORD.
export async function ensureAdminSeed() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@shophub.com";
  const enableSeed = process.env.ENABLE_ADMIN_SEED === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  if (!enableSeed) {
    return; // Seeding disabled
  }
  if (isProd && !process.env.ADMIN_SEED_PASSWORD) {
    console.warn("⚠️ Admin seeding skipped: ADMIN_SEED_PASSWORD missing in production.");
    return;
  }
  const exists = await User.findOne({ email: adminEmail });
  if (exists) {
    return;
  }
  const password = process.env.ADMIN_SEED_PASSWORD || 'admin123';
  await User.create({
    name: process.env.ADMIN_SEED_NAME || "Admin",
    email: adminEmail,
    password,
    role: "admin",
  });
  console.log(`✅ Seeded admin: ${adminEmail} / ${password}`);
}
