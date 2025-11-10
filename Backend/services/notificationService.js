
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const User = require("../models/User");

class NotificationService {
  
  // Create notification for new follower
  static async notifyFollow(follower, targetUser) {
    try {
      await Notification.createNotification({
        recipient: targetUser._id,
        sender: follower._id,
        type: 'follow',
        title: 'New Follower',
        message: `${follower.name} (@${follower.username}) started following you`,
        entityType: 'User',
        entityId: follower._id,
        actionUrl: `/profile/${follower.username}`,
        priority: 'normal'
      });

      // Create activity
      await Activity.createActivity({
        user: follower._id,
        type: 'user_follow',
        action: `started following @${targetUser.username}`,
        entityType: 'User',
        entityId: targetUser._id,
        targetUser: targetUser._id,
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }
  }

  // Create notification for collaboration invite
  static async notifyCollaborationInvite(inviter, invitee, project) {
    try {
      await Notification.createNotification({
        recipient: invitee._id,
        sender: inviter._id,
        type: 'collaboration_invite',
        title: 'Collaboration Invitation',
        message: `${inviter.name} invited you to collaborate on "${project.title}"`,
        entityType: 'Project',
        entityId: project._id,
        actionUrl: `/projects/${project._id}`,
        priority: 'high',
        deliveryChannels: {
          inApp: true,
          email: invitee.preferences?.emailNotifications || false,
          push: invitee.preferences?.pushNotifications || false
        }
      });
    } catch (error) {
      console.error('Error creating collaboration invite notification:', error);
    }
  }

  // Create notification when collaboration is accepted
  static async notifyCollaborationAccepted(accepter, projectOwner, project) {
    try {
      await Notification.createNotification({
        recipient: projectOwner._id,
        sender: accepter._id,
        type: 'collaboration_accepted',
        title: 'Collaboration Accepted',
        message: `${accepter.name} accepted your collaboration invite for "${project.title}"`,
        entityType: 'Project',
        entityId: project._id,
        actionUrl: `/projects/${project._id}`,
        priority: 'normal'
      });

      // Create activity
      await Activity.createActivity({
        user: accepter._id,
        type: 'project_join',
        action: `joined the project "${project.title}"`,
        entityType: 'Project',
        entityId: project._id,
        visibility: 'followers'
      });
    } catch (error) {
      console.error('Error creating collaboration accepted notification:', error);
    }
  }

  // Create notification for new comment
  static async notifyComment(commenter, targetUser, comment, entityType, entity) {
    try {
      // Don't notify if commenting on own content
      if (commenter._id.toString() === targetUser._id.toString()) {
        return;
      }

      await Notification.createNotification({
        recipient: targetUser._id,
        sender: commenter._id,
        type: 'comment',
        title: 'New Comment',
        message: `${commenter.name} commented on your ${entityType.toLowerCase()}: "${comment.content.substring(0, 50)}..."`,
        entityType: 'Comment',
        entityId: comment._id,
        actionUrl: `/${entityType.toLowerCase()}s/${entity._id}#comment-${comment._id}`,
        priority: 'normal'
      });

      // Create activity
      await Activity.createActivity({
        user: commenter._id,
        type: 'comment_create',
        action: `commented on ${targetUser.username}'s ${entityType.toLowerCase()}`,
        entityType: 'Comment',
        entityId: comment._id,
        targetUser: targetUser._id,
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  // Create notification for comment reply
  static async notifyCommentReply(replier, originalCommenter, reply, parentComment) {
    try {
      // Don't notify if replying to own comment
      if (replier._id.toString() === originalCommenter._id.toString()) {
        return;
      }

      await Notification.createNotification({
        recipient: originalCommenter._id,
        sender: replier._id,
        type: 'comment_reply',
        title: 'New Reply',
        message: `${replier.name} replied to your comment: "${reply.content.substring(0, 50)}..."`,
        entityType: 'Comment',
        entityId: reply._id,
        actionUrl: `/comments/${parentComment._id}#reply-${reply._id}`,
        priority: 'normal'
      });

      // Create activity
      await Activity.createActivity({
        user: replier._id,
        type: 'comment_reply',
        action: `replied to a comment`,
        entityType: 'Comment',
        entityId: reply._id,
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating comment reply notification:', error);
    }
  }

  // Create notification for mention in comment
  static async notifyMention(mentioner, mentionedUser, comment, entity) {
    try {
      await Notification.createNotification({
        recipient: mentionedUser._id,
        sender: mentioner._id,
        type: 'comment_mention',
        title: 'You were mentioned',
        message: `${mentioner.name} mentioned you in a comment: "${comment.content.substring(0, 50)}..."`,
        entityType: 'Comment',
        entityId: comment._id,
        actionUrl: `/comments/${comment._id}`,
        priority: 'high'
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  }

  // Create notification for music like
  static async notifyMusicLike(liker, musicOwner, music) {
    try {
      // Don't notify if liking own music
      if (liker._id.toString() === musicOwner._id.toString()) {
        return;
      }

      await Notification.createNotification({
        recipient: musicOwner._id,
        sender: liker._id,
        type: 'music_like',
        title: 'New Like',
        message: `${liker.name} liked your track "${music.title}"`,
        entityType: 'Music',
        entityId: music._id,
        actionUrl: `/music/${music._id}`,
        priority: 'low'
      });

      // Create activity
      await Activity.createActivity({
        user: liker._id,
        type: 'music_like',
        action: `liked "${music.title}" by @${musicOwner.username}`,
        entityType: 'Music',
        entityId: music._id,
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating music like notification:', error);
    }
  }

  // Create notification for new music upload (notify followers)
  static async notifyNewMusicUpload(uploader, music) {
    try {
      // Get uploader's followers
      const user = await User.findById(uploader._id).select('followers');
      const followers = user.followers || [];

      if (followers.length === 0) return;

      // Batch create notifications for all followers
      const notifications = followers.map(followerId => ({
        recipient: followerId,
        sender: uploader._id,
        type: 'new_music_upload',
        title: 'New Music',
        message: `${uploader.name} uploaded a new track: "${music.title}"`,
        entityType: 'Music',
        entityId: music._id,
        actionUrl: `/music/${music._id}`,
        priority: 'normal'
      }));

      await Notification.insertMany(notifications);

      // Create activity
      await Activity.createActivity({
        user: uploader._id,
        type: 'music_upload',
        action: `uploaded a new track "${music.title}"`,
        entityType: 'Music',
        entityId: music._id,
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating new music notification:', error);
    }
  }

  // Create notification for project update
  static async notifyProjectUpdate(updater, project) {
    try {
      // Notify all collaborators except the updater
      const collaborators = project.collaborators
        .filter(collab => 
          collab.user.toString() !== updater._id.toString() && 
          collab.status === 'accepted'
        )
        .map(collab => collab.user);

      if (collaborators.length === 0) return;

      const notifications = collaborators.map(collaboratorId => ({
        recipient: collaboratorId,
        sender: updater._id,
        type: 'project_update',
        title: 'Project Updated',
        message: `${updater.name} made changes to "${project.title}"`,
        entityType: 'Project',
        entityId: project._id,
        actionUrl: `/projects/${project._id}`,
        priority: 'normal'
      }));

      await Notification.insertMany(notifications);

      // Create activity
      await Activity.createActivity({
        user: updater._id,
        type: 'project_update',
        action: `updated the project "${project.title}"`,
        entityType: 'Project',
        entityId: project._id,
        visibility: 'collaborators'
      });
    } catch (error) {
      console.error('Error creating project update notification:', error);
    }
  }

  // Create notification for play milestone
  static async notifyPlayMilestone(musicOwner, music, milestone) {
    try {
      await Notification.createNotification({
        recipient: musicOwner._id,
        type: 'music_play_milestone',
        title: 'Milestone Reached! 🎉',
        message: `Your track "${music.title}" reached ${milestone} plays!`,
        entityType: 'Music',
        entityId: music._id,
        actionUrl: `/music/${music._id}`,
        priority: 'high',
        metadata: { milestone }
      });

      // Create activity
      await Activity.createActivity({
        user: musicOwner._id,
        type: 'milestone_reached',
        action: `"${music.title}" reached ${milestone} plays`,
        entityType: 'Music',
        entityId: music._id,
        visibility: 'public',
        metadata: { milestone }
      });
    } catch (error) {
      console.error('Error creating play milestone notification:', error);
    }
  }

  // Create system notification
  static async notifySystem(userId, title, message, priority = 'normal') {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'system_announcement',
        title,
        message,
        priority,
        deliveryChannels: {
          inApp: true,
          email: true,
          push: false
        }
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  // Create notification for account verification
  static async notifyAccountVerified(userId) {
    try {
      await Notification.createNotification({
        recipient: userId,
        type: 'account_verified',
        title: 'Account Verified! ✓',
        message: 'Congratulations! Your account has been verified.',
        priority: 'high',
        deliveryChannels: {
          inApp: true,
          email: true,
          push: true
        }
      });
    } catch (error) {
      console.error('Error creating account verified notification:', error);
    }
  }

  // Batch delete notifications for a specific entity (when entity is deleted)
  static async deleteEntityNotifications(entityType, entityId) {
    try {
      await Notification.updateMany(
        { entityType, entityId },
        { $set: { isDeleted: true, deletedAt: Date.now() } }
      );
    } catch (error) {
      console.error('Error deleting entity notifications:', error);
    }
  }
}

module.exports = NotificationService;
