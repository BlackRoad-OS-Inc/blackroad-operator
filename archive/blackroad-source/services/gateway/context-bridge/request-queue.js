/**
 * Context Bridge - Request Queue
 * Prevents rate limit exhaustion by queueing requests across tabs
 */

class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.RATE_LIMIT = 5000; // GitHub API: 5000 requests/hour
    this.WINDOW_MS = 60 * 60 * 1000; // 1 hour
    this.MIN_INTERVAL_MS = 100; // Minimum 100ms between requests
  }

  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Check if we're approaching rate limit
      const now = Date.now();
      const windowElapsed = now - this.windowStart;
      
      if (windowElapsed > this.WINDOW_MS) {
        // Reset window
        this.windowStart = now;
        this.requestCount = 0;
      }

      // If we're at 80% of rate limit, slow down
      if (this.requestCount >= this.RATE_LIMIT * 0.8) {
        console.warn('Context Bridge: Approaching rate limit, slowing down requests');
        await this.sleep(1000); // Wait 1 second
      }

      // If we've hit the rate limit, wait for window reset
      if (this.requestCount >= this.RATE_LIMIT) {
        const waitTime = this.WINDOW_MS - windowElapsed;
        console.warn(`Context Bridge: Rate limit reached, waiting ${Math.round(waitTime/1000)}s`);
        await this.sleep(waitTime);
        this.windowStart = Date.now();
        this.requestCount = 0;
      }

      // Process next request
      const request = this.queue.shift();
      
      try {
        const result = await request.fn();
        this.requestCount++;
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }

      // Minimum interval between requests
      await this.sleep(this.MIN_INTERVAL_MS);
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      requestCount: this.requestCount,
      windowStart: new Date(this.windowStart).toISOString(),
      percentOfLimit: Math.round((this.requestCount / this.RATE_LIMIT) * 100)
    };
  }
}

// Export singleton
const requestQueue = new RequestQueue();

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = requestQueue;
}
