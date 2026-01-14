import axiosInstance from './axiosInstance';

/**
 * Screen Time Tracker
 * Tracks user's active time on the platform and sends it to the backend
 */
class ScreenTimeTracker {
  constructor() {
    this.startTime = Date.now();
    this.lastSentTime = Date.now();
    this.isTracking = false;
    this.sendInterval = 10000; // Send every 10 seconds for more frequent updates
    this.intervalId = null;
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    console.log('[ScreenTimeTracker] Initialized');
  }

  /**
   * Start tracking screen time
   */
  start() {
    if (this.isTracking) {
      console.log('[ScreenTimeTracker] Already tracking, skipping start');
      return;
    }

    this.isTracking = true;
    this.startTime = Date.now();
    this.lastSentTime = Date.now();

    console.log('[ScreenTimeTracker] ★ START - Beginning to track screen time at', new Date().toISOString());

    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Send screen time periodically (every 10 seconds)
    this.intervalId = setInterval(() => {
      const duration = Math.floor((Date.now() - this.lastSentTime) / 1000);
      console.log('[ScreenTimeTracker] Interval triggered - duration since last send:', duration, 'seconds');
      this.sendScreenTime();
    }, this.sendInterval);

    // Send initial data after 10 seconds
    setTimeout(() => {
      console.log('[ScreenTimeTracker] Initial send timeout triggered');
      this.sendScreenTime();
    }, this.sendInterval);

    console.log('[ScreenTimeTracker] Started tracking with interval:', this.sendInterval, 'ms');
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
      this.sendScreenTime();
    } else {
      // Page became visible again - reset timer to track next cycle
      this.lastSentTime = Date.now();
    }
  }

  /**
   * Send accumulated screen time to backend
   */
  async sendScreenTime() {
    if (!this.isTracking) {
      return;
    }

    // Skip if page is hidden
    if (document.hidden) {
      console.log('[ScreenTimeTracker] Page is hidden, skipping send');
      return;
    }

    const now = Date.now();
    const duration = Math.floor((now - this.lastSentTime) / 1000); // in seconds

    console.log('[ScreenTimeTracker] sendScreenTime() called - duration:', duration, 'seconds, now:', now, 'lastSent:', this.lastSentTime);

    if (duration < 1) {
      console.log('[ScreenTimeTracker] Duration too short:', duration, 'seconds, skipping send');
      return; // Don't send if less than 1 second
    }

    try {
      console.log('[ScreenTimeTracker] → POST /activity-logs/track-screen-time with duration:', duration);
      const response = await axiosInstance.post('/activity-logs/track-screen-time', {
        duration: Math.max(1, duration), // Ensure at least 1 second
      });

      this.lastSentTime = now;
      console.log(`[ScreenTimeTracker] ✓ SUCCESS - Sent ${duration}s of screen time`);
      console.log('[ScreenTimeTracker] Response:', response.data);
    } catch (error) {
      console.error('[ScreenTimeTracker] ✗ FAILED - Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        fullError: error
      });
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
