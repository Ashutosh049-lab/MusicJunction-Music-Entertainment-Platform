
const Activity = require("../models/Activity");
const User = require("../models/User");

// Get user's activity feed (their own activities)
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 20,
      types = null 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Parse types if provided
    const activityTypes = types ? types.split(',') : null;

    // Check if requesting user can see this activity
    const includePrivate = req.user._id.toString() === userId;

    const activities = await Activity.getUserFeed(userId, {
      limit: parseInt(limit),
      skip,
      types: activityTypes,
      includePrivate
    });

    const total = await Activity.countDocuments({
      user: userId,
      isDeleted: false,
      visibility: includePrivate ? { $in: ['public', 'followers', 'private'] } : { $ne: 'private' }
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity',
      error: error.message
    });
  }
};

// Get current user's feed (from users they follow)
exports.getFollowingFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 30 
    } = req.query;

    const skip = (page - 1) * limit;

    // Get user's following list
    const user = await User.findById(userId).select('following');
    const followingIds = user.following || [];

    if (followingIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          activities: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    const activities = await Activity.getFollowingFeed(userId, followingIds, {
      limit: parseInt(limit),
      skip
    });

    const total = await Activity.countDocuments({
      user: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] },
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get following feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following feed',
      error: error.message
    });
  }
};

// Get public/global feed (for explore/discover)
exports.getPublicFeed = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      types = null 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Parse types if provided
    const activityTypes = types ? types.split(',') : null;

    const activities = await Activity.getPublicFeed({
      limit: parseInt(limit),
      skip,
      types: activityTypes
    });

    const total = await Activity.countDocuments({
      visibility: 'public',
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get public feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public feed',
      error: error.message
    });
  }
};

// Get activities for a specific entity (Music, Project, etc.)
exports.getEntityActivities = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;

    const activities = await Activity.getEntityActivities(entityType, entityId, {
      limit: parseInt(limit),
      skip
    });

    const total = await Activity.countDocuments({
      entityType,
      entityId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get entity activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entity activities',
      error: error.message
    });
  }
};

// Get trending activities (most engaged)
exports.getTrendingActivities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      timeframe = '24h' // 24h, 7d, 30d
    } = req.query;

    const skip = (page - 1) * limit;

    // Calculate date based on timeframe
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(timeframe) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '24h':
      default:
        cutoffDate.setHours(now.getHours() - 24);
    }

    const activities = await Activity.find({
      visibility: 'public',
      isDeleted: false,
      createdAt: { $gte: cutoffDate }
    })
      .populate('user', 'name username avatarUrl isVerified')
      .populate('targetUser', 'name username avatarUrl')
      .populate('entity')
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        activities,
        timeframe
      }
    });
  } catch (error) {
    console.error('Get trending activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending activities',
      error: error.message
    });
  }
};

// Get user's activity stats
exports.getActivityStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Activity.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalActivities = await Activity.countDocuments({
      user: userId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        totalActivities,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity stats',
      error: error.message
    });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user._id;

    const activity = await Activity.findOne({
      _id: activityId,
      user: userId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    await activity.softDelete();

    res.status(200).json({
      success: true,
      message: 'Activity deleted'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message
    });
  }
};

module.exports = exports;
