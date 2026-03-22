/**
 * Context Bridge - Cache Manager
 * Manages in-memory caching of fetched contexts
 */

class ContextCache {
  constructor(ttlMs = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  set(url, content) {
    this.cache.set(url, {
      content,
      timestamp: Date.now()
    });
  }

  get(url) {
    const entry = this.cache.get(url);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      // Expired, remove it
      this.cache.delete(url);
      return null;
    }

    return entry.content;
  }

  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    return {
      size: entries.length,
      validEntries: entries.filter(([_, v]) => (now - v.timestamp) <= this.ttl).length,
      expiredEntries: entries.filter(([_, v]) => (now - v.timestamp) > this.ttl).length,
      totalBytes: entries.reduce((sum, [_, v]) => sum + v.content.length, 0)
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(url);
      }
    }
  }
}

// Export singleton
const contextCache = new ContextCache();

// Cleanup every minute
setInterval(() => contextCache.cleanup(), 60000);

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = contextCache;
}
