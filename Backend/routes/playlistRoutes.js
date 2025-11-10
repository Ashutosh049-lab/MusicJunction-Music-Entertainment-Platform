
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const optionalAuth = require("../middlewares/optionalAuth");
const playlistController = require("../controllers/playlistController");

// Playlist CRUD
// @route   POST /api/playlists
// @desc    Create a new playlist
// @access  Private
router.post("/", auth, playlistController.createPlaylist);

// @route   GET /api/playlists
// @desc    Get all playlists (with filters)
// @access  Public
router.get("/", optionalAuth, playlistController.getPlaylists);

// @route   GET /api/playlists/user/:userId
// @desc    Get user's playlists
// @access  Public (shows public only) / Private (shows all if own)
router.get("/user/:userId", optionalAuth, playlistController.getUserPlaylists);

// @route   GET /api/playlists/:playlistId
// @desc    Get a specific playlist
// @access  Public (for public playlists) / Private (for private)
router.get("/:playlistId", optionalAuth, playlistController.getPlaylist);

// @route   PUT /api/playlists/:playlistId
// @desc    Update playlist details
// @access  Private (owner only)
router.put("/:playlistId", auth, playlistController.updatePlaylist);

// @route   DELETE /api/playlists/:playlistId
// @desc    Delete a playlist
// @access  Private (owner only)
router.delete("/:playlistId", auth, playlistController.deletePlaylist);

// Track Management
// @route   POST /api/playlists/:playlistId/tracks
// @desc    Add track to playlist
// @access  Private
router.post("/:playlistId/tracks", auth, playlistController.addTrack);

// @route   DELETE /api/playlists/:playlistId/tracks/:musicId
// @desc    Remove track from playlist
// @access  Private
router.delete("/:playlistId/tracks/:musicId", auth, playlistController.removeTrack);

// @route   PUT /api/playlists/:playlistId/tracks/reorder
// @desc    Reorder tracks in playlist
// @access  Private (owner only)
router.put("/:playlistId/tracks/reorder", auth, playlistController.reorderTracks);

// Collaboration
// @route   POST /api/playlists/:playlistId/collaborators
// @desc    Add collaborator to playlist
// @access  Private (owner only)
router.post("/:playlistId/collaborators", auth, playlistController.addCollaborator);

// @route   DELETE /api/playlists/:playlistId/collaborators/:collaboratorId
// @desc    Remove collaborator from playlist
// @access  Private (owner only)
router.delete("/:playlistId/collaborators/:collaboratorId", auth, playlistController.removeCollaborator);

// Engagement
// @route   POST /api/playlists/:playlistId/follow
// @desc    Follow/unfollow a playlist
// @access  Private
router.post("/:playlistId/follow", auth, playlistController.toggleFollow);

// @route   POST /api/playlists/:playlistId/like
// @desc    Like/unlike a playlist
// @access  Private
router.post("/:playlistId/like", auth, playlistController.toggleLike);

module.exports = router;
