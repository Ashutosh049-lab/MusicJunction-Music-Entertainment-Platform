
const Playlist = require("../models/Playlist");
const Music = require("../models/Music");
const mongoose = require("mongoose");

/**
 * @route   POST /api/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
exports.createPlaylist = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      coverImage,
      genre,
      mood,
      tags,
      isCollaborative,
      visibility
    } = req.body;
    const userId = req.user.id;

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    // Create playlist
    const newPlaylist = new Playlist({
      name: name.trim(),
      description: description || "",
      owner: userId,
      type: type || "user",
      category: category || "custom",
      coverImage: coverImage || "",
      genre: genre || "",
      mood: mood || "",
      tags: tags || [],
      isCollaborative: isCollaborative || false,
      visibility: visibility || "private"
    });

    await newPlaylist.save();

    res.status(201).json({
      message: "Playlist created successfully",
      playlist: newPlaylist
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   GET /api/playlists/:playlistId
 * @desc    Get a specific playlist
 * @access  Public (for public playlists) / Private (for private)
 */
exports.getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId)
      .populate("owner", "name username avatarUrl")
      .populate("collaborators", "name username avatarUrl")
      .populate({
        path: "tracks.music",
        select: "title artist coverImage duration genre averageRating uploadedBy",
        populate: { path: "uploadedBy", select: "name username avatarUrl" }
      })
      .populate("tracks.addedBy", "name username avatarUrl");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check visibility permissions
    if (playlist.visibility === "private") {
      if (!userId || (playlist.owner._id.toString() !== userId && 
          !playlist.collaborators.some(c => c._id.toString() === userId))) {
        return res.status(403).json({ 
          message: "You don't have permission to view this playlist" 
        });
      }
    }

    res.status(200).json({ playlist });
  } catch (error) {
    console.error("Error getting playlist:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   GET /api/playlists
 * @desc    Get all playlists (with filters)
 * @access  Public
 */
exports.getPlaylists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
      category,
      genre,
      mood,
      type,
      featured,
      userId
    } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { visibility: "public", isActive: true };

    if (category) query.category = category;
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;
    if (type) query.type = type;
    if (featured === "true") query.isFeatured = true;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.owner = userId;
    }

    const playlists = await Playlist.find(query)
      .populate("owner", "name username avatarUrl")
      .select("-tracks") // Don't include full tracks array for list view
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPlaylists = await Playlist.countDocuments(query);

    res.status(200).json({
      playlists,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPlaylists / parseInt(limit)),
        totalPlaylists,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error getting playlists:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   GET /api/playlists/user/:userId
 * @desc    Get user's playlists
 * @access  Public (shows public only) / Private (shows all if own playlists)
 */
exports.getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const query = { owner: userId, isActive: true };

    // Show all playlists if requesting own playlists, otherwise only public
    if (!requesterId || requesterId !== userId) {
      query.visibility = "public";
    }

    const playlists = await Playlist.find(query)
      .select("-tracks")
      .sort({ createdAt: -1 });

    res.status(200).json({ playlists });
  } catch (error) {
    console.error("Error getting user playlists:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/playlists/:playlistId
 * @desc    Update playlist details
 * @access  Private (owner only)
 */
exports.updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const {
      name,
      description,
      coverImage,
      genre,
      mood,
      tags,
      visibility,
      isCollaborative
    } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({
        message: "You can only edit your own playlists"
      });
    }

    // Update fields
    if (name !== undefined) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description;
    if (coverImage !== undefined) {
      playlist.coverImage = coverImage;
      playlist.coverImageType = "custom";
    }
    if (genre !== undefined) playlist.genre = genre;
    if (mood !== undefined) playlist.mood = mood;
    if (tags !== undefined) playlist.tags = tags;
    if (visibility !== undefined) playlist.visibility = visibility;
    if (isCollaborative !== undefined) playlist.isCollaborative = isCollaborative;

    await playlist.save();

    res.status(200).json({
      message: "Playlist updated successfully",
      playlist
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/playlists/:playlistId
 * @desc    Delete a playlist
 * @access  Private (owner only)
 */
exports.deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({
        message: "You can only delete your own playlists"
      });
    }

    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/tracks
 * @desc    Add track to playlist
 * @access  Private
 */
exports.addTrack = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { musicId, note } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || 
        !mongoose.Types.ObjectId.isValid(musicId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const playlist = await Playlist.findById(playlistId);
    const music = await Music.findById(musicId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // Check permissions
    const isOwner = playlist.owner.toString() === userId;
    const isCollaborator = (playlist.collaborators || []).some(c => c.toString() === userId);

    if (!isOwner && (!playlist.isCollaborative || !isCollaborator)) {
      return res.status(403).json({
        message: "You don't have permission to add tracks to this playlist"
      });
    }

    // Prevent duplicates early so we can return a proper status code
    const isDuplicate = !playlist.allowDuplicates && playlist.tracks.some(t => t.music.toString() === musicId.toString());
    if (isDuplicate) {
      return res.status(409).json({ message: "Track already exists in playlist" });
    }

    await playlist.addTrack(musicId, userId, note);

    res.status(200).json({
      message: "Track added to playlist",
      playlist
    });
  } catch (error) {
    console.error("Error adding track:", error);
    res.status(500).json({
      message: error.message || "Server error"
    });
  }
};

/**
 * @route   DELETE /api/playlists/:playlistId/tracks/:musicId
 * @desc    Remove track from playlist
 * @access  Private
 */
exports.removeTrack = async (req, res) => {
  try {
    const { playlistId, musicId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || 
        !mongoose.Types.ObjectId.isValid(musicId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check permissions
    const isOwner = playlist.owner.toString() === userId;
    const isCollaborator = playlist.collaborators.some(c => c.toString() === userId);

    if (!isOwner && (!playlist.isCollaborative || !isCollaborator)) {
      return res.status(403).json({
        message: "You don't have permission to remove tracks from this playlist"
      });
    }

    await playlist.removeTrack(musicId);

    res.status(200).json({
      message: "Track removed from playlist",
      playlist
    });
  } catch (error) {
    console.error("Error removing track:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/playlists/:playlistId/tracks/reorder
 * @desc    Reorder tracks in playlist
 * @access  Private
 */
exports.reorderTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { musicId, newPosition } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only the playlist owner can reorder tracks"
      });
    }

    await playlist.reorderTracks(musicId, newPosition);

    res.status(200).json({
      message: "Tracks reordered successfully",
      playlist
    });
  } catch (error) {
    console.error("Error reordering tracks:", error);
    res.status(500).json({
      message: error.message || "Server error"
    });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/collaborators
 * @desc    Add collaborator to playlist
 * @access  Private (owner only)
 */
exports.addCollaborator = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { collaboratorId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || 
        !mongoose.Types.ObjectId.isValid(collaboratorId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only the playlist owner can add collaborators"
      });
    }

    // Check if already a collaborator
    if (playlist.collaborators.some(c => c.toString() === collaboratorId)) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    // Make playlist collaborative if not already
    playlist.isCollaborative = true;
    playlist.collaborators.push(collaboratorId);

    await playlist.save();

    res.status(200).json({
      message: "Collaborator added successfully",
      playlist
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/playlists/:playlistId/collaborators/:collaboratorId
 * @desc    Remove collaborator from playlist
 * @access  Private (owner only)
 */
exports.removeCollaborator = async (req, res) => {
  try {
    const { playlistId, collaboratorId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || 
        !mongoose.Types.ObjectId.isValid(collaboratorId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    if (playlist.owner.toString() !== userId) {
      return res.status(403).json({
        message: "Only the playlist owner can remove collaborators"
      });
    }

    playlist.collaborators = playlist.collaborators.filter(
      c => c.toString() !== collaboratorId
    );

    await playlist.save();

    res.status(200).json({
      message: "Collaborator removed successfully",
      playlist
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/follow
 * @desc    Follow/unfollow a playlist
 * @access  Private
 */
exports.toggleFollow = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    await playlist.toggleFollow(userId);

    const isFollowing = playlist.followers.some(f => f.toString() === userId);

    res.status(200).json({
      message: isFollowing ? "Playlist followed" : "Playlist unfollowed",
      isFollowing,
      followersCount: playlist.followersCount
    });
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * @route   POST /api/playlists/:playlistId/like
 * @desc    Like/unlike a playlist
 * @access  Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    await playlist.toggleLike(userId);

    const hasLiked = playlist.likes.some(l => l.toString() === userId);

    res.status(200).json({
      message: hasLiked ? "Playlist liked" : "Playlist unliked",
      hasLiked,
      likesCount: playlist.likesCount
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = exports;
