import User from "../models/User.js";

export async function ensureAdminSeed() {
  const adminEmail = "admin@shophub.com";
  const exists = await User.findOne({ email: adminEmail });
  if (exists) return;

  await User.create({
    name: "Admin",
    email: adminEmail,
    password: "admin123",
    role: "admin",
  });
  console.log("✅ Seeded default admin: admin@shophub.com / admin123");
}
