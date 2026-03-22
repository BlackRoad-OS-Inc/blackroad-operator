// Amundson Patent Framework - Event Bus Monitoring
// Monitors for unauthorized use or derivative works

const {
  AMUNDSON_EQUATIONS
} = require('../modules/amundson-patent-framework.cjs');

const fs = require('fs');

// Simple text similarity using Levenshtein-style distance
function stringSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return 1 - (matrix[len1][len2] / maxLen);
}

// Check content for potential Amundson equation usage
function checkForAmundsonContent(content, options = {}) {
  const {
    threshold = 0.7, // Similarity threshold for alert
    exact = false    // Require exact match vs similarity
  } = options;

  const results = {
    detected: false,
    matches: [],
    alerts: []
  };

  const normalized = content.toLowerCase().replace(/\s+/g, ' ');

  // Check against each Amundson equation
  for (const [key, eq] of Object.entries(AMUNDSON_EQUATIONS)) {
    const eqNorm = eq.canonical.toLowerCase().replace(/\s+/g, ' ');

    // Exact match check
    if (normalized.includes(eqNorm)) {
      results.detected = true;
      results.matches.push({
        equation: key,
        type: 'exact',
        confidence: 1.0,
        name: eq.name
      });
      results.alerts.push(
        `EXACT MATCH: Content contains protected equation ${key} (${eq.name})`
      );
      continue;
    }

    // Similarity check (if not requiring exact)
    if (!exact) {
      const similarity = stringSimilarity(normalized, eqNorm);
      if (similarity >= threshold) {
        results.detected = true;
        results.matches.push({
          equation: key,
          type: 'similar',
          confidence: similarity,
          name: eq.name
        });
        results.alerts.push(
          `SIMILARITY ALERT: Content ${(similarity * 100).toFixed(1)}% similar to equation ${key} (${eq.name})`
        );
      }
    }

    // Check for key phrases unique to Amundson set
    const keyPhrases = [
      'augmented absorption',
      'coherence standing-wave ratio',
      'cswr',
      'augmented risk',
      'human-aligned regularization',
      'amplitude alignment',
      'qlms',
      'quantum learning management'
    ];

    for (const phrase of keyPhrases) {
      if (normalized.includes(phrase)) {
        results.detected = true;
        results.alerts.push(
          `KEY PHRASE DETECTED: "${phrase}" - potential reference to Amundson framework`
        );
      }
    }
  }

  return results;
}

// Log potential IP violation
function logIPAlert(alert, source = 'unknown') {
  const timestamp = new Date().toISOString();
  const logDir = '/srv/patent-archive/amundson/ip-alerts';

  try {
    fs.mkdirSync(logDir, { recursive: true });

    const logEntry = {
      timestamp,
      source,
      alert,
      severity: alert.type === 'exact' ? 'HIGH' : 'MEDIUM'
    };

    const logFile = `${logDir}/${timestamp.split('T')[0]}.jsonl`;
    fs.appendFileSync(
      logFile,
      JSON.stringify(logEntry) + '\n',
      'utf8'
    );

    console.warn(`[AMUNDSON-IP-ALERT] ${JSON.stringify(logEntry)}`);
  } catch (e) {
    console.error('[AMUNDSON-IP-ALERT] Failed to log alert:', e);
  }
}

// Event bus integration
function attachEventMonitoring(eventBus) {
  if (!eventBus || typeof eventBus.on !== 'function') {
    console.warn('[amundson-monitor] Event bus not available, monitoring disabled');
    return;
  }

  // Monitor content publication events
  eventBus.on('content:published', (event) => {
    const content = event.content || event.body || '';
    const source = event.source || event.author || 'unknown';

    const results = checkForAmundsonContent(content, { threshold: 0.7 });

    if (results.detected) {
      console.warn(`[AMUNDSON-MONITOR] Potential IP usage detected from: ${source}`);

      for (const match of results.matches) {
        logIPAlert(match, source);
      }

      for (const alert of results.alerts) {
        console.warn(`[AMUNDSON-MONITOR] ${alert}`);
      }

      // Optionally trigger notification to legal/admin
      eventBus.emit('ip:violation:detected', {
        framework: 'amundson',
        source,
        matches: results.matches,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Monitor agent queries for equation access
  eventBus.on('agent:query', (event) => {
    const query = event.query || '';
    const agentId = event.agentId || 'unknown';

    // Track which agents are accessing Amundson equations
    for (const [key, eq] of Object.entries(AMUNDSON_EQUATIONS)) {
      if (query.toLowerCase().includes(key.toLowerCase()) ||
          query.toLowerCase().includes(eq.name.toLowerCase())) {

        console.info(`[AMUNDSON-MONITOR] Agent ${agentId} accessed equation ${key}`);

        // Log access for audit trail
        const accessLog = {
          timestamp: new Date().toISOString(),
          agentId,
          equation: key,
          query: query.slice(0, 200) // Truncate for privacy
        };

        const logDir = '/srv/patent-archive/amundson/access-logs';
        fs.mkdirSync(logDir, { recursive: true });
        const logFile = `${logDir}/access.jsonl`;
        fs.appendFileSync(logFile, JSON.stringify(accessLog) + '\n', 'utf8');
      }
    }
  });

  console.log('[amundson-monitor] Event monitoring active');
}

module.exports = {
  checkForAmundsonContent,
  logIPAlert,
  attachEventMonitoring,
  stringSimilarity
};
