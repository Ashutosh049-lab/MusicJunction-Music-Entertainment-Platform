
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ratingController = require("../controllers/ratingController");

// @route   POST /api/ratings/:targetType/:targetId
// @desc    Create or update a rating
// @access  Private
router.post("/:targetType/:targetId", auth, ratingController.rateItem);

// @route   GET /api/ratings/:targetType/:targetId
// @desc    Get all ratings for an item
// @access  Public
router.get("/:targetType/:targetId", ratingController.getRatings);

// @route   GET /api/ratings/:targetType/:targetId/user
// @desc    Get user's rating for an item
// @access  Private
router.get("/:targetType/:targetId/user", auth, ratingController.getUserRating);

// @route   DELETE /api/ratings/:targetType/:targetId
// @desc    Delete user's rating
// @access  Private
router.delete("/:targetType/:targetId", auth, ratingController.deleteRating);

// @route   POST /api/ratings/:ratingId/helpful
// @desc    Mark a rating as helpful
// @access  Private
router.post("/:ratingId/helpful", auth, ratingController.markHelpful);

// @route   GET /api/ratings/top-rated
// @desc    Get top-rated items
// @access  Public
router.get("/top-rated", ratingController.getTopRated);

module.exports = router;
