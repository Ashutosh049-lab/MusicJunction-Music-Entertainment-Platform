import axios from '../lib/axios';

type InteractionType = 'play' | 'like' | 'skip' | 'complete' | 'share';

interface TrackInteractionData {
  musicId: string;
  interactionType: InteractionType;
  duration?: number;
  completionRate?: number;
}

class InteractionTracker {
  private playStartTimes: Map<string, number> = new Map();
  private trackDurations: Map<string, number> = new Map();

  /**
   * Track when a track starts playing
   */
  trackPlay(musicId: string, duration: number) {
    this.playStartTimes.set(musicId, Date.now());
    this.trackDurations.set(musicId, duration);
    
    this.sendInteraction({
      musicId,
      interactionType: 'play'
    });
  }

  /**
   * Track when a track is skipped (played less than 30%)
   */
  trackSkip(musicId: string, currentTime: number) {
    const duration = this.trackDurations.get(musicId) || 0;
    const completionRate = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    if (completionRate < 30) {
      this.sendInteraction({
        musicId,
        interactionType: 'skip',
        duration: Math.floor(currentTime),
        completionRate: Math.floor(completionRate)
      });
    }
    
    this.playStartTimes.delete(musicId);
    this.trackDurations.delete(musicId);
  }

  /**
   * Track when a track is completed (played more than 90%)
   */
  trackComplete(musicId: string, currentTime: number) {
    const startTime = this.playStartTimes.get(musicId);
    const duration = this.trackDurations.get(musicId) || 0;
    const completionRate = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    if (completionRate >= 90) {
      const listenDuration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      
      this.sendInteraction({
        musicId,
        interactionType: 'complete',
        duration: listenDuration,
        completionRate: Math.floor(completionRate)
      });
    }
    
    this.playStartTimes.delete(musicId);
    this.trackDurations.delete(musicId);
  }

  /**
   * Track when a track is liked/unliked
   */
  trackLike(musicId: string) {
    this.sendInteraction({
      musicId,
      interactionType: 'like'
    });
  }

  /**
   * Track when a track is shared
   */
  trackShare(musicId: string) {
    this.sendInteraction({
      musicId,
      interactionType: 'share'
    });
  }

  /**
   * Send interaction data to backend
   */
  private async sendInteraction(data: TrackInteractionData) {
    try {
      await axios.post('/recommendations/track', data);
    } catch (error) {
      // Silently fail to not interrupt user experience
      console.debug('Failed to track interaction:', error);
    }
  }

  /**
   * Clear all tracking data for a specific track
   */
  clearTrackData(musicId: string) {
    this.playStartTimes.delete(musicId);
    this.trackDurations.delete(musicId);
  }
}

// Export singleton instance
export const interactionTracker = new InteractionTracker();
