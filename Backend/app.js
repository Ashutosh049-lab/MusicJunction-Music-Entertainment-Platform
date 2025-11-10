const express = require("express");
const cors = require("cors");

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

// CORS configuration to support credentials
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Musician-Key', 'x-musician-key', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);
app.use("/uploads", express.static("uploads"));
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

module.exports = app;
