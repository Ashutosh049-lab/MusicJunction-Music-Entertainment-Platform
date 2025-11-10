const SocialShare = require('../models/SocialShare');
const Music = require('../models/Music');
const Playlist = require('../models/Playlist');
const Project = require('../models/Project');
const User = require('../models/User');
const axios = require('axios');

class SocialSharingService {
  
  /**
   * Generate share link for content
   */
  generateShareLink(contentType, contentId) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/share/${contentType}/${contentId}`;
  }
  
  /**
   * Generate share text with hashtags
   */
  async generateShareText(contentType, contentId, customText = null) {
    if (customText) return customText;
    
    let content;
    let defaultText = '';
    
    switch (contentType) {
      case 'music':
        content = await Music.findById(contentId).populate('uploadedBy');
        if (content) {
          defaultText = `🎵 Check out "${content.title}" by ${content.artist} on MusicJunction!`;
        }
        break;
      
      case 'playlist':
        content = await Playlist.findById(contentId).populate('createdBy');
        if (content) {
          defaultText = `🎧 Listen to my playlist "${content.name}" on MusicJunction!`;
        }
        break;
      
      case 'project':
        content = await Project.findById(contentId).populate('creator');
        if (content) {
          defaultText = `🎼 Check out my music project "${content.title}" on MusicJunction!`;
        }
        break;
      
      case 'profile':
        content = await User.findById(contentId);
        if (content) {
          defaultText = `👤 Follow ${content.name} on MusicJunction!`;
        }
        break;
    }
    
    return defaultText || '🎵 Discover amazing music on MusicJunction!';
  }
  
  /**
   * Generate relevant hashtags
   */
  async generateHashtags(contentType, contentId) {
    const baseHashtags = ['MusicJunction', 'Music'];
    
    if (contentType === 'music') {
      const music = await Music.findById(contentId);
      if (music) {
        const genreTag = music.genre.replace(/\s+/g, '');
        return [...baseHashtags, genreTag, ...music.tags.slice(0, 3)];
      }
    }
    
    return baseHashtags;
  }
  
  /**
   * Create a social share record
   */
  async createShare(userId, contentType, contentId, platform, options = {}) {
    try {
      // Validate content exists
      const contentModel = this.getContentModel(contentType);
      const content = await contentModel.findById(contentId);
      
      if (!content) {
        throw new Error(`${contentType} not found`);
      }
      
      // Generate share link and text
      const shareUrl = this.generateShareLink(contentType, contentId);
      const shareText = await this.generateShareText(contentType, contentId, options.customText);
      const hashtags = await this.generateHashtags(contentType, contentId);
      
      // Create share record
      const share = new SocialShare({
        userId,
        contentType,
        contentId,
        contentModel: contentModel.modelName,
        platform,
        shareUrl,
        shareText,
        hashtags: options.hashtags || hashtags,
        status: 'pending'
      });
      
      // Platform-specific sharing
      let shareResult;
      switch (platform) {
        case 'twitter':
          shareResult = await this.shareToTwitter(shareUrl, shareText, hashtags);
          break;
        case 'facebook':
          shareResult = await this.shareToFacebook(shareUrl, shareText);
          break;
        case 'instagram':
          shareResult = await this.shareToInstagram(content, shareText, hashtags);
          break;
        default:
          // For copy_link, whatsapp, telegram, etc - just generate the link
          shareResult = { success: true, url: shareUrl };
      }
      
      if (shareResult.success) {
        share.status = 'success';
        share.externalPostId = shareResult.postId;
        share.externalPostUrl = shareResult.postUrl;
      } else {
        share.status = 'failed';
        share.errorMessage = shareResult.error;
      }
      
      await share.save();
      
      // Update share count on content
      await this.updateShareCount(contentType, contentId);
      
      return {
        success: true,
        share,
        shareUrl: platform === 'copy_link' ? shareUrl : shareResult.postUrl || shareUrl
      };
      
    } catch (error) {
      console.error('Error creating share:', error);
      throw error;
    }
  }
  
  /**
   * Share to Twitter/X
   */
  async shareToTwitter(shareUrl, shareText, hashtags) {
    try {
      // Note: Requires Twitter API credentials and user OAuth token
      const twitterApiKey = process.env.TWITTER_API_KEY;
      const twitterApiSecret = process.env.TWITTER_API_SECRET;
      const userAccessToken = process.env.TWITTER_USER_TOKEN; // Should be per-user
      
      if (!twitterApiKey || !userAccessToken) {
        return { 
          success: true, 
          url: this.getTwitterShareUrl(shareText, hashtags, shareUrl),
          note: 'Direct API posting not configured - returning share URL'
        };
      }
      
      // Twitter API v2 endpoint for creating tweets
      const tweetText = `${shareText}\n\n${hashtags.map(h => `#${h}`).join(' ')}\n${shareUrl}`;
      
      // In production, you would use proper OAuth and Twitter SDK
      // For now, return the web intent URL
      return {
        success: true,
        url: this.getTwitterShareUrl(shareText, hashtags, shareUrl)
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get Twitter web intent URL
   */
  getTwitterShareUrl(text, hashtags, url) {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    const encodedHashtags = hashtags.join(',');
    
    return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
  }
  
  /**
   * Share to Facebook
   */
  async shareToFacebook(shareUrl, shareText) {
    try {
      const facebookAppId = process.env.FACEBOOK_APP_ID;
      
      if (!facebookAppId) {
        return {
          success: true,
          url: this.getFacebookShareUrl(shareUrl),
          note: 'Direct API posting not configured - returning share URL'
        };
      }
      
      // In production, use Facebook Graph API to post
      // For now, return the share dialog URL
      return {
        success: true,
        url: this.getFacebookShareUrl(shareUrl)
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get Facebook share dialog URL
   */
  getFacebookShareUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }
  
  /**
   * Share to Instagram (Story)
   */
  async shareToInstagram(content, shareText, hashtags) {
    try {
      // Instagram requires image/video content
      // Return instructions for manual sharing
      return {
        success: true,
        url: `instagram://story-camera`,
        note: 'Instagram Story - use mobile app to share with generated image',
        imageUrl: content.coverImage || content.bannerImage
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get WhatsApp share URL
   */
  getWhatsAppShareUrl(text, url) {
    const message = encodeURIComponent(`${text}\n${url}`);
    return `https://wa.me/?text=${message}`;
  }
  
  /**
   * Get Telegram share URL
   */
  getTelegramShareUrl(text, url) {
    const message = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    return `https://t.me/share/url?url=${encodedUrl}&text=${message}`;
  }
  
  /**
   * Get content model based on type
   */
  getContentModel(contentType) {
    const models = {
      'music': Music,
      'playlist': Playlist,
      'project': Project,
      'profile': User
    };
    return models[contentType];
  }
  
  /**
   * Update share count on content
   */
  async updateShareCount(contentType, contentId) {
    const model = this.getContentModel(contentType);
    await model.findByIdAndUpdate(contentId, { $inc: { sharesCount: 1 } });
  }
  
  /**
   * Get share analytics for user
   */
  async getUserShareAnalytics(userId, options = {}) {
    const { startDate, endDate } = options;
    
    const query = { userId };
    if (startDate || endDate) {
      query.sharedAt = {};
      if (startDate) query.sharedAt.$gte = new Date(startDate);
      if (endDate) query.sharedAt.$lte = new Date(endDate);
    }
    
    const shares = await SocialShare.find(query);
    
    const analytics = {
      totalShares: shares.length,
      totalClicks: shares.reduce((sum, s) => sum + s.clickCount, 0),
      totalConversions: shares.reduce((sum, s) => sum + s.conversionCount, 0),
      byPlatform: {},
      byContentType: {},
      recentShares: shares.slice(0, 10)
    };
    
    // Group by platform
    shares.forEach(share => {
      if (!analytics.byPlatform[share.platform]) {
        analytics.byPlatform[share.platform] = {
          count: 0,
          clicks: 0,
          conversions: 0
        };
      }
      analytics.byPlatform[share.platform].count += 1;
      analytics.byPlatform[share.platform].clicks += share.clickCount;
      analytics.byPlatform[share.platform].conversions += share.conversionCount;
      
      // Group by content type
      if (!analytics.byContentType[share.contentType]) {
        analytics.byContentType[share.contentType] = 0;
      }
      analytics.byContentType[share.contentType] += 1;
    });
    
    return analytics;
  }
  
  /**
   * Get share analytics for specific content
   */
  async getContentShareAnalytics(contentType, contentId) {
    return SocialShare.getContentAnalytics(contentType, contentId);
  }
  
  /**
   * Track share link click
   */
  async trackShareClick(shareId) {
    const share = await SocialShare.findById(shareId);
    if (share) {
      await share.recordClick();
      return { success: true };
    }
    return { success: false, error: 'Share not found' };
  }
  
  /**
   * Track share conversion (signup/engagement from share)
   */
  async trackShareConversion(shareId) {
    const share = await SocialShare.findById(shareId);
    if (share) {
      await share.recordConversion();
      return { success: true };
    }
    return { success: false, error: 'Share not found' };
  }
  
  /**
   * Get platform-specific share URLs (for frontend)
   */
  async getPlatformShareUrls(contentType, contentId, customText = null) {
    const shareUrl = this.generateShareLink(contentType, contentId);
    const shareText = await this.generateShareText(contentType, contentId, customText);
    const hashtags = await this.generateHashtags(contentType, contentId);
    
    return {
      twitter: this.getTwitterShareUrl(shareText, hashtags, shareUrl),
      facebook: this.getFacebookShareUrl(shareUrl),
      whatsapp: this.getWhatsAppShareUrl(shareText, shareUrl),
      telegram: this.getTelegramShareUrl(shareText, shareUrl),
      copyLink: shareUrl
    };
  }
}

module.exports = new SocialSharingService();
