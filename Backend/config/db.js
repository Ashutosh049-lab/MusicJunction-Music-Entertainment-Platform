
const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_MS = 5000;

const connectDB = async () => {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.warn("⚠️  MONGO_URL not set. API will start but DB operations will fail.");
    return;
  }

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(uri);
      console.log("✅ MongoDB Connected Successfully");
      break;
    } catch (err) {
      attempt++;
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
      if (attempt >= MAX_RETRIES) {
        console.error("🚨 Giving up connecting to MongoDB. API stays up for health/CORS diagnostics.");
        break;
      }
      await new Promise((res) => setTimeout(res, RETRY_MS));
    }
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err?.message || err);
  });
};

module.exports = connectDB;
