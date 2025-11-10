
const Comment = require("../models/Comment");
const Music = require("../models/Music");
const mongoose = require("mongoose");

/**
 * @route   POST /api/comments/:targetType/:targetId
 * @desc    Create a comment on music track, playlist, or project
 * @access  Private
 */
exports.createComment = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { content, parentComment, timestamp, mentions, hashtags } = req.body;
    const userId = req.user.id;

    // Validate targetType
    const validTypes = ['Music', 'Playlist', 'Project', 'User'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ 
        message: "Invalid target type" 
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: "Comment is too long (max 2000 characters)" });
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

    // Calculate depth for nested comments
    let depth = 0;
    let replyToUser = null;

    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parent comment ID" });
      }

      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      depth = parent.depth + 1;
      replyToUser = parent.author;

      // Limit nesting depth
      if (depth > 5) {
        return res.status(400).json({ 
          message: "Maximum comment nesting depth reached" 
        });
      }
    }

    // Create comment
    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      targetType,
      targetId,
      parentComment: parentComment || null,
      replyToUser,
      depth,
      timestamp: timestamp || null,
      mentions: mentions || [],
      hashtags: hashtags || []
    });

    await newComment.save();

    // Populate author info
    await newComment.populate('author', 'name username avatarUrl');
    if (replyToUser) {
      await newComment.populate('replyToUser', 'name username');
    }

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/comments/:targetType/:targetId
 * @desc    Get all comments for a specific item
 * @access  Public
 */
exports.getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = "createdAt", 
      order = "desc",
      parentOnly = false 
    } = req.query;

    // Validate targetType
    const validTypes = ['Music', 'Playlist', 'Project', 'User'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {
      targetType,
      targetId,
      isDeleted: false,
      moderationStatus: { $in: ['approved'] }
    };

    // Only get top-level comments if specified
    if (parentOnly === 'true') {
      query.parentComment = null;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name username avatarUrl')
      .populate('replyToUser', 'name username')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/comments/:commentId/replies
 * @desc    Get all replies to a specific comment
 * @access  Public
 */
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
      moderationStatus: 'approved'
    })
      .populate('author', 'name username avatarUrl')
      .populate('replyToUser', 'name username')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false,
      moderationStatus: 'approved'
    });

    res.status(200).json({
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReplies / parseInt(limit)),
        totalReplies,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error getting replies:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update a comment
 * @access  Private
 */
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ 
        message: "You can only edit your own comments" 
      });
    }

    // Update comment
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = Date.now();

    await comment.save();
    await comment.populate('author', 'name username avatarUrl');

    res.status(200).json({
      message: "Comment updated successfully",
      comment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment (soft delete)
 * @access  Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check ownership (or admin role if you have one)
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ 
        message: "You can only delete your own comments" 
      });
    }

    await comment.softDelete();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   POST /api/comments/:commentId/like
 * @desc    Like/unlike a comment
 * @access  Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user already liked
    const hasLiked = comment.likes.some(id => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likes.push(userId);
      comment.likesCount += 1;
    }

    await comment.save();

    res.status(200).json({
      message: hasLiked ? "Comment unliked" : "Comment liked",
      likesCount: comment.likesCount,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   POST /api/comments/:commentId/flag
 * @desc    Flag a comment for moderation
 * @access  Private
 */
exports.flagComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.flag(reason);

    res.status(200).json({ 
      message: "Comment flagged for review",
      flagCount: comment.flagCount
    });
  } catch (error) {
    console.error("Error flagging comment:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @route   POST /api/comments/:commentId/pin
 * @desc    Pin/unpin a comment (owner only)
 * @access  Private
 */
exports.togglePin = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get target to check ownership
    const targetModel = mongoose.model(comment.targetType);
    const target = await targetModel.findById(comment.targetId);

    if (!target) {
      return res.status(404).json({ message: "Target not found" });
    }

    // Check if user is the owner of the target
    const ownerId = target.uploadedBy || target.owner || target.author;
    if (ownerId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Only the content owner can pin comments" 
      });
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    res.status(200).json({
      message: comment.isPinned ? "Comment pinned" : "Comment unpinned",
      isPinned: comment.isPinned
    });
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = exports;
