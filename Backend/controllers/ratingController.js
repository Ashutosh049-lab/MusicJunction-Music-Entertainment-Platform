
const Rating = require("../models/Rating");
const Music = require("../models/Music");
const Playlist = require("../models/Playlist");
const mongoose = require("mongoose");

/**
 * @route   POST /api/ratings/:targetType/:targetId
 * @desc    Create or update a rating for a music track, playlist, or project
 * @access  Private
 */
exports.rateItem = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate targetType
    const validTypes = ['Music', 'Playlist', 'Project'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ 
        message: "Invalid target type. Must be 'Music', 'Playlist', or 'Project'" 
      });
    }

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    // Check if target exists
    const targetModel = mongoose.model(targetType);
    const target = await targetModel.findById(targetId);
    
    if (!target) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    // Check if user already rated this item
    let existingRating = await Rating.findOne({
      user: userId,
      targetType,
      targetId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      if (review !== undefined) existingRating.review = review;
      await existingRating.save();

      return res.status(200).json({
        message: "Rating updated successfully",
        rating: existingRating
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        user: userId,
        targetType,
        targetId,
        rating,
        review: review || ""
      });

      await newRating.save();

      return res.status(201).json({
        message: "Rating created successfully",
        rating: newRating
      });
    }
  } catch (error) {
    console.error("Error rating item:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/ratings/:targetType/:targetId
 * @desc    Get all ratings for a specific item
 * @access  Public
 */
exports.getRatings = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 20, sortBy = "createdAt", order = "desc" } = req.query;

    // Validate targetType
    const validTypes = ['Music', 'Playlist', 'Project'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ 
        message: "Invalid target type" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({
      targetType,
      targetId,
      moderationStatus: "approved"
    })
      .populate("user", "name username avatarUrl")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalRatings = await Rating.countDocuments({
      targetType,
      targetId,
      moderationStatus: "approved"
    });

    // Get rating statistics
    const targetModel = mongoose.model(targetType);
    const target = await targetModel.findById(targetId).select('averageRating ratingsCount ratingsDistribution');

    res.status(200).json({
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / parseInt(limit)),
        totalRatings,
        limit: parseInt(limit)
      },
      statistics: {
        averageRating: target?.averageRating || 0,
        ratingsCount: target?.ratingsCount || 0,
        distribution: target?.ratingsDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  } catch (error) {
    console.error("Error getting ratings:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/ratings/:targetType/:targetId/user
 * @desc    Get logged-in user's rating for a specific item
 * @access  Private
 */
exports.getUserRating = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      user: userId,
      targetType,
      targetId
    }).populate("user", "name username avatarUrl");

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json({ rating });
  } catch (error) {
    console.error("Error getting user rating:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   DELETE /api/ratings/:targetType/:targetId
 * @desc    Delete user's rating
 * @access  Private
 */
exports.deleteRating = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOneAndDelete({
      user: userId,
      targetType,
      targetId
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   POST /api/ratings/:ratingId/helpful
 * @desc    Mark a rating as helpful
 * @access  Private
 */
exports.markHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Check if user already voted
    const hasVoted = rating.votedBy.some(id => id.toString() === userId);

    if (hasVoted) {
      // Remove vote
      rating.votedBy = rating.votedBy.filter(id => id.toString() !== userId);
      rating.helpfulVotes = Math.max(0, rating.helpfulVotes - 1);
    } else {
      // Add vote
      rating.votedBy.push(userId);
      rating.helpfulVotes += 1;
    }

    await rating.save();

    res.status(200).json({
      message: hasVoted ? "Vote removed" : "Marked as helpful",
      helpfulVotes: rating.helpfulVotes,
      hasVoted: !hasVoted
    });
  } catch (error) {
    console.error("Error marking rating as helpful:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/ratings/top-rated
 * @desc    Get top-rated music tracks
 * @access  Public
 */
exports.getTopRated = async (req, res) => {
  try {
    const { targetType = 'Music', limit = 20, minRatings = 5 } = req.query;

    const validTypes = ['Music', 'Playlist', 'Project'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    const targetModel = mongoose.model(targetType);
    
    const topRated = await targetModel.find({
      ratingsCount: { $gte: parseInt(minRatings) },
      visibility: 'public',
      uploadStatus: targetType === 'Music' ? 'active' : undefined
    })
      .sort({ averageRating: -1, ratingsCount: -1 })
      .limit(parseInt(limit))
      .populate(targetType === 'Music' ? 'uploadedBy' : 'owner', 'name username avatarUrl');

    res.status(200).json({ topRated });
  } catch (error) {
    console.error("Error getting top rated items:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = exports;
