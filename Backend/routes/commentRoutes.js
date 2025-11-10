
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const commentController = require("../controllers/commentController");

// @route   POST /api/comments/:targetType/:targetId
// @desc    Create a comment
// @access  Private
router.post("/:targetType/:targetId", auth, commentController.createComment);

// @route   GET /api/comments/:targetType/:targetId
// @desc    Get all comments for an item
// @access  Public
router.get("/:targetType/:targetId", commentController.getComments);

// @route   GET /api/comments/:commentId/replies
// @desc    Get replies to a comment
// @access  Public
router.get("/:commentId/replies", commentController.getReplies);

// @route   PUT /api/comments/:commentId
// @desc    Update a comment
// @access  Private
router.put("/:commentId", auth, commentController.updateComment);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete("/:commentId", auth, commentController.deleteComment);

// @route   POST /api/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.post("/:commentId/like", auth, commentController.toggleLike);

// @route   POST /api/comments/:commentId/flag
// @desc    Flag a comment for moderation
// @access  Private
router.post("/:commentId/flag", auth, commentController.flagComment);

// @route   POST /api/comments/:commentId/pin
// @desc    Pin/unpin a comment
// @access  Private
router.post("/:commentId/pin", auth, commentController.togglePin);

module.exports = router;
