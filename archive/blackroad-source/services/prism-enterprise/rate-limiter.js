/**
 * Simple in-memory rate limiter
 * Tracks requests per IP address with configurable limits
 */

const requestCounts = new Map();
const CLEANUP_INTERVAL = 60000; // Cleanup every minute

// Configuration from environment
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute default
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 requests per window
const TRUST_PROXY_IP_HEADER = (process.env.RATE_LIMIT_TRUST_PROXY || '').toLowerCase() === 'true';

// Periodically clean up old entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW * 2) {
      requestCounts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Check if request should be rate limited
 * @param {string} ip - Client IP address
 * @returns {{ limited: boolean, remaining: number, resetTime: number }}
 */
function checkRateLimit(ip) {
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, {
      count: 1,
      windowStart: now,
    });
    return {
      limited: false,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  const record = requestCounts.get(ip);

  // Check if window has expired
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.windowStart = now;
    return {
      limited: false,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      remaining: 0,
      resetTime: record.windowStart + RATE_LIMIT_WINDOW,
    };
  }

  return {
    limited: false,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetTime: record.windowStart + RATE_LIMIT_WINDOW,
  };
}

/**
 * Get client IP from request
 * Handles X-Forwarded-For header for proxied requests
 */
function getClientIp(req) {
  if (TRUST_PROXY_IP_HEADER) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ipFromHeader = forwarded.split(',')[0].trim();
      if (ipFromHeader) {
        return ipFromHeader;
      }
    }
  }
  const directIp = (req && req.socket && req.socket.remoteAddress) || req.ip;
  return directIp || 'unknown';
}

/**
 * Rate limiting middleware
 * Call this before processing requests
 */
function rateLimitMiddleware(req, res) {
  const ip = getClientIp(req);
  const result = checkRateLimit(ip);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

  if (result.limited) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
    res.end(JSON.stringify({
      error: 'Too many requests',
      retryAfter: result.resetTime,
    }));
    return false;
  }

  return true;
}

module.exports = {
  rateLimitMiddleware,
  checkRateLimit,
  getClientIp,
};
