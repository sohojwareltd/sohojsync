import axiosInstance from './axiosInstance';

/**
 * Screen Time Tracker
 * Tracks user's active time on the platform and sends it to the backend
 */
class ScreenTimeTracker {
  constructor() {
    this.startTime = Date.now();
    this.lastSentTime = Date.now();
    this.isActive = true;
    this.isTracking = false;
    this.sendInterval = 60000; // Send every 60 seconds
    this.intervalId = null;
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
  }

  /**
   * Start tracking screen time
   */
  start() {
    if (this.isTracking) return;

    this.isTracking = true;
    this.startTime = Date.now();
    this.lastSentTime = Date.now();
    this.isActive = !document.hidden;

    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Send screen time periodically
    this.intervalId = setInterval(() => {
      this.sendScreenTime();
    }, this.sendInterval);

    console.log('[ScreenTimeTracker] Started tracking');
  }

  /**
   * Stop tracking screen time
   */
  stop() {
    if (!this.isTracking) return;

    this.isTracking = false;

    // Send remaining time before stopping
    this.sendScreenTime();

    // Clean up
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);

    console.log('[ScreenTimeTracker] Stopped tracking');
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page became hidden - send accumulated time
      this.isActive = false;
      this.sendScreenTime();
    } else {
      // Page became visible again
      this.isActive = true;
      this.lastSentTime = Date.now();
    }
  }

  /**
   * Send accumulated screen time to backend
   */
  async sendScreenTime() {
    if (!this.isActive || !this.isTracking) return;

    const now = Date.now();
    const duration = Math.floor((now - this.lastSentTime) / 1000); // in seconds

    if (duration < 5) return; // Don't send if less than 5 seconds

    try {
      await axiosInstance.post('/activity-logs/track-screen-time', {
        duration: duration,
      });

      this.lastSentTime = now;
      console.log(`[ScreenTimeTracker] Sent ${duration}s of screen time`);
    } catch (error) {
      console.error('[ScreenTimeTracker] Failed to send screen time:', error);
    }
  }

  /**
   * Reset tracker (e.g., on logout)
   */
  reset() {
    this.stop();
    this.startTime = Date.now();
    this.lastSentTime = Date.now();
  }
}

// Create a singleton instance
const screenTimeTracker = new ScreenTimeTracker();

export default screenTimeTracker;
