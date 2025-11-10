const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const musicRoutes = require("./routes/musicRoutes");
const projectRoutes = require("./routes/projectRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const commentRoutes = require("./routes/commentRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const mixRoutes = require("./routes/mixRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const socialSharingRoutes = require("./routes/socialSharingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// CORS configuration to support credentials and env-configured frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5173',
  'https://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl/Postman) and known frontends
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Musician-Key', 'x-musician-key', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
// Static files with CORS headers
app.use("/uploads", cors(corsOptions), express.static("uploads"));
app.use("/api/projects", projectRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/mix", mixRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/social", socialSharingRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("🎵 Welcome to MusicJunction API");
});

// Simple health endpoint to aid deployment diagnostics (no secrets exposed)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    env: {
      jwt: Boolean(process.env.JWT_SECRET),
      mongo: Boolean(process.env.MONGO_URL),
      frontendUrl: process.env.FRONTEND_URL || null,
      nodeEnv: process.env.NODE_ENV || null,
    },
    db: {
      readyState: mongoose.connection?.readyState ?? null,
    },
  });
});

module.exports = app;






