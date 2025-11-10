

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const musicController = require("../controllers/musicController");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

// File filter for audio only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/flac", "audio/aac"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only audio files allowed!"), false);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ========== SPOTIFY INTEGRATION ROUTES (Must be before parametric routes) ==========
router.get("/spotify/search", musicController.searchSpotify); // Search Spotify tracks
router.post("/spotify/link", auth, checkRole(["musician"]), musicController.linkSpotifyTrack); // Link Spotify track to library (musicians only)

// ========== LOCAL UPLOAD ROUTES ==========
router.post("/upload", auth, checkRole(["musician"]), upload.single("music"), musicController.uploadTrack); // musicians only

// ========== TRACK MANAGEMENT ROUTES ==========
router.get("/", musicController.getTracks); // Public: Get all tracks with filters

// ========== STREAMING ROUTES ==========
router.get("/stream/:id", musicController.streamTrack); // Public: Stream with range support

// ========== PARAMETRIC ROUTES (Must be after specific routes) ==========
router.get("/:id", musicController.getTrackById); // Public: Get single track
router.delete("/:id", auth, checkRole(["musician"]), musicController.deleteTrack); // musicians only
router.post("/:id/like", auth, musicController.toggleLike); // Any authenticated user can like/unlike

module.exports = router;
