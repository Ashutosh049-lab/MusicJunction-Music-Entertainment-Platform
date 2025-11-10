
const Notification = require("../models/Notification");

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      type = null,
      isRead = null 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    const query = {
      recipient: userId,
      isDeleted: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: Date.now() } }
      ]
    };

    if (type) {
      query.type = type;
    }

    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('sender', 'name username avatarUrl isVerified')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// Mark notification(s) as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds array is required'
      });
    }

    // Mark multiple notifications as read
    await Notification.markManyAsRead(notificationIds, userId);

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Mark single notification as read
exports.markSingleAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark single as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { 
        recipient: userId, 
        isRead: false,
        isDeleted: false
      },
      { 
        $set: { 
          isRead: true, 
          readAt: Date.now() 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.softDelete();

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Delete multiple notifications
exports.deleteMultiple = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'notificationIds array is required'
      });
    }

    await Notification.updateMany(
      { 
        _id: { $in: notificationIds },
        recipient: userId
      },
      { 
        $set: { 
          isDeleted: true, 
          deletedAt: Date.now() 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications deleted'
    });
  } catch (error) {
    console.error('Delete multiple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};

// Delete all read notifications
exports.clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { 
        recipient: userId,
        isRead: true,
        isDeleted: false
      },
      { 
        $set: { 
          isDeleted: true, 
          deletedAt: Date.now() 
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'All read notifications cleared'
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
      error: error.message
    });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await req.user.populate('preferences');

    res.status(200).json({
      success: true,
      data: {
        emailNotifications: user.preferences.emailNotifications,
        pushNotifications: user.preferences.pushNotifications
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailNotifications, pushNotifications } = req.body;

    const updateData = {};
    if (emailNotifications !== undefined) {
      updateData['preferences.emailNotifications'] = emailNotifications;
    }
    if (pushNotifications !== undefined) {
      updateData['preferences.pushNotifications'] = pushNotifications;
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $set: updateData });

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

module.exports = exports;
