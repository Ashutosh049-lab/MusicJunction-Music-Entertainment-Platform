
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const notificationController = require("../controllers/notificationController");
const activityController = require("../controllers/activityController");

// ============ NOTIFICATION ROUTES ============

// Get all notifications for current user
router.get("/", auth, notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", auth, notificationController.getUnreadCount);

// Mark multiple notifications as read
router.post("/mark-read", auth, notificationController.markAsRead);

// Mark single notification as read
router.put("/:notificationId/read", auth, notificationController.markSingleAsRead);

// Mark all notifications as read
router.put("/mark-all-read", auth, notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", auth, notificationController.deleteNotification);

// Delete multiple notifications
router.post("/delete-multiple", auth, notificationController.deleteMultiple);

// Clear all read notifications
router.delete("/clear-read", auth, notificationController.clearReadNotifications);

// Get notification preferences
router.get("/preferences", auth, notificationController.getPreferences);

// Update notification preferences
router.put("/preferences", auth, notificationController.updatePreferences);


// ============ ACTIVITY FEED ROUTES ============

// Get public/global activity feed (explore/discover)
router.get("/activity/public", activityController.getPublicFeed);

// Get activity feed from users you follow
router.get("/activity/following", auth, activityController.getFollowingFeed);

// Get trending activities
router.get("/activity/trending", activityController.getTrendingActivities);

// Get specific user's activity feed
router.get("/activity/user/:userId", auth, activityController.getUserActivity);

// Get user's activity stats
router.get("/activity/user/:userId/stats", auth, activityController.getActivityStats);

// Get activities for a specific entity (Music, Project, etc.)
router.get("/activity/:entityType/:entityId", activityController.getEntityActivities);

// Delete activity
router.delete("/activity/:activityId", auth, activityController.deleteActivity);


module.exports = router;
