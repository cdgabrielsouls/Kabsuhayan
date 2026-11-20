require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");
const { hashPassword } = require("../src/utils/auth");

async function main() {
  const { MONGODB_URI, JWT_SECRET, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing from server/.env.");
  if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error("Set a random JWT_SECRET of at least 32 characters in server/.env.");
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env, then run npm run create-admin.");
  }
  if (ADMIN_PASSWORD.length < 8 || ADMIN_PASSWORD.length > 128) {
    throw new Error("ADMIN_PASSWORD must be 8 to 128 characters.");
  }

  await mongoose.connect(MONGODB_URI, { dbName: "kabsuhayan" });
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name: ADMIN_NAME.trim(), passwordHash, role: "admin", status: "active" } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready for ${user.email} (ID: ${user._id}).`);
  console.log("Remove ADMIN_PASSWORD from server/.env after setup; the password is stored as a hash.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
