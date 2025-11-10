
const Music = require("../models/Music");
const path = require("path");
const fs = require("fs");
const spotifyService = require("../utils/spotifyService");

// @desc Upload a new track
exports.uploadTrack = async (req, res) => {
  try {
    console.log('Upload request body:', req.body);
    console.log('Upload request file:', req.file);
    
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, artist, genre, album, duration, description } = req.body;
    if (!title || !artist || !genre) {
      return res.status(400).json({ message: "Title, artist, and genre are required" });
    }

    const newTrack = await Music.create({
      title,
      artist,
      genre,
      album,
      description,
      duration: duration ? parseFloat(duration) : 0,
      source: 'local',
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
    });

    res.status(201).json(newTrack);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error while uploading music" });
  }
};

// @desc Get all tracks (with filtering and pagination)
exports.getTracks = async (req, res) => {
  try {
    const { source, genre, artist, page = 1, limit = 20, search, uploadedBy } = req.query;
    
    const query = {};
    if (source) query.source = source;
    if (genre) query.genre = genre;
    if (artist) query.artist = new RegExp(artist, 'i');
    if (uploadedBy) query.uploadedBy = uploadedBy;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { album: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const tracks = await Music.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Music.countDocuments(query);

    res.json({
      tracks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get tracks error:", err);
    res.status(500).json({ message: "Server error fetching tracks" });
  }
};

// @desc Stream music file with range support (for seeking)
exports.streamTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await Music.findById(id);

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    // Handle external sources (redirect or proxy)
    if (track.source !== 'local') {
      if (track.previewUrl) {
        // For Spotify preview URLs, redirect to the preview
        return res.redirect(track.previewUrl);
      }
      return res.status(400).json({ 
        message: "Streaming not available", 
        externalUrl: track.externalUrl 
      });
    }

    // Stream local file with range support
    const filename = path.basename(track.fileUrl);
    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Audio file not found" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Increment play count
    track.playCount += 1;
    await track.save();

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': track.mimeType || 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      // No range, send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': track.mimeType || 'audio/mpeg',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ message: "Error streaming track" });
  }
};

// @desc Get single track by ID
exports.getTrackById = async (req, res) => {
  try {
    const track = await Music.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .populate("likes", "name");

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.json(track);
  } catch (err) {
    console.error("Get track error:", err);
    res.status(500).json({ message: "Server error fetching track" });
  }
};

// @desc Search Spotify tracks
exports.searchSpotify = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const tracks = await spotifyService.searchTracks(query, parseInt(limit));
    res.json({ tracks });
  } catch (err) {
    console.error("Spotify search error:", err);
    res.status(500).json({ message: err.message || "Error searching Spotify" });
  }
};

// @desc Link/Save Spotify track to user's library
exports.linkSpotifyTrack = async (req, res) => {
  try {
    const { spotifyId } = req.body;

    if (!spotifyId) {
      return res.status(400).json({ message: "Spotify track ID is required" });
    }

    // Check if track already exists
    const existingTrack = await Music.findOne({ 
      source: 'spotify', 
      externalId: spotifyId 
    });

    if (existingTrack) {
      return res.status(200).json({ 
        message: "Track already linked", 
        track: existingTrack 
      });
    }

    // Fetch track data from Spotify
    const spotifyTrack = await spotifyService.getTrackById(spotifyId);

    // Create new track in database
    const newTrack = await Music.create({
      ...spotifyTrack,
      genre: 'Unknown', // Spotify API doesn't provide genre at track level
      uploadedBy: req.user.id,
    });

    res.status(201).json({ 
      message: "Spotify track linked successfully", 
      track: newTrack 
    });
  } catch (err) {
    console.error("Link Spotify track error:", err);
    res.status(500).json({ message: err.message || "Error linking Spotify track" });
  }
};

// @desc Like/Unlike a track
exports.toggleLike = async (req, res) => {
  try {
    const track = await Music.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    const userId = req.user.id;
    const likeIndex = track.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      track.likes.splice(likeIndex, 1);
      await track.save();
      res.json({ message: "Track unliked", liked: false, likesCount: track.likes.length });
    } else {
      // Like
      track.likes.push(userId);
      await track.save();
      res.json({ message: "Track liked", liked: true, likesCount: track.likes.length });
    }
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// @desc Delete a track
exports.deleteTrack = async (req, res) => {
  try {
    const track = await Music.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    // Check if user owns the track
    if (track.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this track" });
    }

    // Delete local file if it exists
    if (track.source === 'local' && track.fileUrl) {
      const filename = path.basename(track.fileUrl);
      const filePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Music.findByIdAndDelete(req.params.id);
    res.json({ message: "Track deleted successfully" });
  } catch (err) {
    console.error("Delete track error:", err);
    res.status(500).json({ message: "Error deleting track" });
  }
};
