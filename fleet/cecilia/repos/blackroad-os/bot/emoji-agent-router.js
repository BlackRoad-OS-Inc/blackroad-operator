// bot/emoji-agent-router.js
// 🔁 Routes emoji to math, status, or escalation handlers

const {
  countEmojis,
  generateHeatmap,
  generateMarkdownReport,
  reactionToCategory,
} = require("./emoji-heatmap");

const {
  emojiToStatus,
  reactionToStatus,
  createProjectStatusSync,
} = require("./project-status-sync");

/**
 * Route types for emoji handling
 */
const ROUTE_TYPES = {
  MATH: "math",
  STATUS: "status",
  ESCALATION: "escalation",
  NOTIFICATION: "notification",
  IGNORE: "ignore",
};

/**
 * Escalation emojis that trigger special handling
 */
const ESCALATION_EMOJIS = ["🛟", "🚨", "🔥"];

/**
 * Emojis that trigger status updates
 */
const STATUS_EMOJIS = ["✅", "🟡", "⬜", "❌", "🔁", "🤔"];

/**
 * Reactions that trigger status updates
 */
const STATUS_REACTIONS = [
  "rocket",
  "hooray",
  "eyes",
  "-1",
  "confused",
];

/**
 * Determine the route type for an emoji
 * @param {string} emoji - The emoji to route
 * @returns {string} - Route type
 */
function determineEmojiRoute(emoji) {
  if (ESCALATION_EMOJIS.includes(emoji)) {
    return ROUTE_TYPES.ESCALATION;
  }
  if (STATUS_EMOJIS.includes(emoji)) {
    return ROUTE_TYPES.STATUS;
  }
  return ROUTE_TYPES.IGNORE;
}

/**
 * Determine the route type for a reaction
 * @param {string} reaction - GitHub reaction name
 * @returns {string} - Route type
 */
function determineReactionRoute(reaction) {
  if (STATUS_REACTIONS.includes(reaction)) {
    return ROUTE_TYPES.STATUS;
  }
  if (reaction === "rotating_light") {
    return ROUTE_TYPES.ESCALATION;
  }
  return ROUTE_TYPES.IGNORE;
}

/**
 * Route context containing all relevant information
 * @typedef {Object} RouteContext
 * @property {string} type - Route type
 * @property {string} emoji - The triggering emoji
 * @property {string|null} status - Status name if applicable
 * @property {boolean} isEscalation - Whether this is an escalation
 * @property {string|null} category - Emoji category
 */

/**
 * Create a route context for an emoji
 * @param {string} emoji - The emoji
 * @returns {RouteContext} - Route context
 */
function createEmojiRouteContext(emoji) {
  const type = determineEmojiRoute(emoji);
  const status = emojiToStatus(emoji);

  return {
    type,
    emoji,
    status,
    isEscalation: type === ROUTE_TYPES.ESCALATION,
    category: null, // Direct emojis don't map to categories
  };
}

/**
 * Create a route context for a reaction
 * @param {string} reaction - GitHub reaction name
 * @returns {RouteContext} - Route context
 */
function createReactionRouteContext(reaction) {
  const type = determineReactionRoute(reaction);
  const status = reactionToStatus(reaction);
  const category = reactionToCategory(reaction);

  return {
    type,
    emoji: reaction, // Store reaction name
    status,
    isEscalation: type === ROUTE_TYPES.ESCALATION,
    category,
  };
}

/**
 * Handler result
 * @typedef {Object} HandlerResult
 * @property {boolean} handled - Whether the event was handled
 * @property {string} action - Action taken
 * @property {Object|null} data - Additional data
 */

/**
 * Create an emoji agent router
 * @param {Object} options - Router options
 * @param {Object} options.octokit - GitHub Octokit instance
 * @param {string} options.projectId - Default project ID
 * @param {Function} options.onEscalation - Escalation callback
 * @param {Function} options.onStatusUpdate - Status update callback
 * @param {Function} options.onMathRequest - Math calculation callback
 * @returns {Object} - Router methods
 */
function createEmojiAgentRouter(options = {}) {
  const {
    octokit,
    projectId,
    onEscalation,
    onStatusUpdate,
    onMathRequest,
  } = options;

  // Create project sync if octokit is available
  const projectSync = octokit
    ? createProjectStatusSync(octokit)
    : null;

  /**
   * Handle an escalation event
   * @param {RouteContext} context - Route context
   * @param {Object} eventData - GitHub event data
   * @returns {Promise<HandlerResult>} - Handler result
   */
  async function handleEscalation(context, eventData) {
    const result = {
      handled: true,
      action: "escalation_triggered",
      data: {
        emoji: context.emoji,
        issueNumber: eventData.issueNumber,
        owner: eventData.owner,
        repo: eventData.repo,
      },
    };

    if (onEscalation) {
      try {
        await onEscalation(context, eventData);
      } catch (error) {
        console.error(`⚠️ Escalation callback error: ${error.message}`);
        result.data.callbackError = error.message;
      }
    }

    console.log(
      `🛟 Escalation triggered for issue #${eventData.issueNumber}`
    );

    return result;
  }

  /**
   * Handle a status update event
   * @param {RouteContext} context - Route context
   * @param {Object} eventData - GitHub event data
   * @returns {Promise<HandlerResult>} - Handler result
   */
  async function handleStatusUpdate(context, eventData) {
    const result = {
      handled: true,
      action: "status_update",
      data: {
        emoji: context.emoji,
        status: context.status,
        issueNumber: eventData.issueNumber,
      },
    };

    // Update project status if sync is available
    if (projectSync && projectId && context.status) {
      try {
        const syncResult = await projectSync.syncIssueStatusFromEmoji({
          owner: eventData.owner,
          repo: eventData.repo,
          issueNumber: eventData.issueNumber,
          emoji: context.emoji,
          projectId,
        });
        result.data.syncResult = syncResult;
      } catch (error) {
        result.data.syncError = error.message;
      }
    }

    if (onStatusUpdate) {
      try {
        await onStatusUpdate(context, eventData);
      } catch (error) {
        console.error(`⚠️ Status update callback error: ${error.message}`);
        result.data.callbackError = error.message;
      }
    }

    console.log(
      `📊 Status update: ${context.status} for issue #${eventData.issueNumber}`
    );

    return result;
  }

  /**
   * Handle a math/calculation request
   * @param {string} text - Text containing emojis
   * @param {Object} options - Options for calculation
   * @returns {HandlerResult} - Handler result
   */
  function handleMathRequest(text, options = {}) {
    const counts = countEmojis(text);
    const heatmap = generateHeatmap(counts);
    const report = options.generateReport
      ? generateMarkdownReport(heatmap, options.title)
      : null;

    const result = {
      handled: true,
      action: "math_calculation",
      data: {
        counts,
        heatmap,
        report,
      },
    };

    if (onMathRequest) {
      onMathRequest(result.data);
    }

    return result;
  }

  /**
   * Route and handle an emoji event
   * @param {string} emoji - The emoji
   * @param {Object} eventData - GitHub event data
   * @returns {Promise<HandlerResult>} - Handler result
   */
  async function routeEmoji(emoji, eventData) {
    const context = createEmojiRouteContext(emoji);

    switch (context.type) {
      case ROUTE_TYPES.ESCALATION:
        return handleEscalation(context, eventData);
      case ROUTE_TYPES.STATUS:
        return handleStatusUpdate(context, eventData);
      default:
        return {
          handled: false,
          action: "ignored",
          data: { emoji, reason: "No handler for emoji" },
        };
    }
  }

  /**
   * Route and handle a reaction event
   * @param {string} reaction - GitHub reaction name
   * @param {Object} eventData - GitHub event data
   * @returns {Promise<HandlerResult>} - Handler result
   */
  async function routeReaction(reaction, eventData) {
    const context = createReactionRouteContext(reaction);

    switch (context.type) {
      case ROUTE_TYPES.ESCALATION:
        return handleEscalation(context, eventData);
      case ROUTE_TYPES.STATUS:
        return handleStatusUpdate(context, eventData);
      default:
        return {
          handled: false,
          action: "ignored",
          data: { reaction, reason: "No handler for reaction" },
        };
    }
  }

  /**
   * Process a batch of emojis for math calculations
   * @param {Array<string>} texts - Array of text to analyze
   * @param {Object} options - Options
   * @returns {HandlerResult} - Handler result with aggregated data
   */
  function processBatchMath(texts, options = {}) {
    const allCounts = texts.map((text) => countEmojis(text));
    const aggregated = allCounts.reduce(
      (acc, counts) => {
        for (const key of Object.keys(acc)) {
          acc[key] += counts[key] || 0;
        }
        return acc;
      },
      {
        completed: 0,
        blocked: 0,
        escalation: 0,
        inProgress: 0,
        review: 0,
        notStarted: 0,
        total: 0,
      }
    );

    const heatmap = generateHeatmap(aggregated);
    const report = options.generateReport
      ? generateMarkdownReport(heatmap, options.title || "Batch Analysis")
      : null;

    return {
      handled: true,
      action: "batch_math_calculation",
      data: {
        itemCount: texts.length,
        aggregatedCounts: aggregated,
        heatmap,
        report,
      },
    };
  }

  return {
    routeEmoji,
    routeReaction,
    handleMathRequest,
    processBatchMath,
    handleEscalation,
    handleStatusUpdate,
    createEmojiRouteContext,
    createReactionRouteContext,
// Routes emoji reactions to appropriate agent handlers

const AGENT_ROUTES = {
  // Status change reactions
  "✅": { agent: "status-agent", action: "mark_done" },
  "🟡": { agent: "status-agent", action: "mark_in_progress" },
  "⬜": { agent: "status-agent", action: "mark_not_started" },
  "❌": { agent: "status-agent", action: "mark_blocked" },
  "🔁": { agent: "status-agent", action: "mark_rework" },
  
  // Special agent triggers
  "🤔": { agent: "review-agent", action: "request_review" },
  "🛟": { agent: "guardian-agent", action: "escalate" },
  "🤖": { agent: "auto-assign-agent", action: "auto_assign" },
  "🧍‍♀️": { agent: "assignment-agent", action: "assign_human" },
  "👥": { agent: "team-agent", action: "tag_team" }
};

// Reaction name to emoji mapping for GitHub reactions
const REACTION_TO_EMOJI = {
  "+1": "👍",
  "-1": "👎",
  laugh: "😄",
  hooray: "🎉",
  confused: "😕",
  heart: "❤️",
  rocket: "🚀",
  eyes: "👀"
};

// Reaction name to agent routing
const REACTION_ROUTES = {
  hooray: { agent: "status-agent", action: "mark_done" },
  rocket: { agent: "status-agent", action: "mark_done" },
  eyes: { agent: "status-agent", action: "mark_in_progress" },
  "+1": { agent: "status-agent", action: "approve" },
  "-1": { agent: "status-agent", action: "mark_blocked" },
  confused: { agent: "status-agent", action: "mark_blocked" }
};

/**
 * Route an emoji to the appropriate agent
 * @param {string} emoji - The emoji character
 * @returns {Object|null} - Agent routing info or null if not found
 */
function routeEmoji(emoji) {
  return AGENT_ROUTES[emoji] || null;
}

/**
 * Route a reaction name to the appropriate agent
 * @param {string} reaction - The reaction name (e.g., "rocket")
 * @returns {Object|null} - Agent routing info or null if not found
 */
function routeReaction(reaction) {
  return REACTION_ROUTES[reaction] || null;
}

/**
 * Get all registered emoji routes
 * @returns {Object} - All emoji routes
 */
function getEmojiRoutes() {
  return { ...AGENT_ROUTES };
}

/**
 * Get all registered reaction routes
 * @returns {Object} - All reaction routes
 */
function getReactionRoutes() {
  return { ...REACTION_ROUTES };
}

/**
 * Convert a reaction name to its emoji representation
 * @param {string} reaction - The reaction name
 * @returns {string|null} - The emoji or null if not found
 */
function reactionToEmoji(reaction) {
  return REACTION_TO_EMOJI[reaction] || null;
}

/**
 * Process an incoming reaction and return handling instructions
 * @param {Object} options - Processing options
 * @param {string} options.reaction - The reaction name
 * @param {Object} options.payload - The event payload
 * @returns {Object} - Processing result with routing info
 */
function processReaction({ reaction, payload } = {}) {
  if (!reaction || typeof reaction !== "string") {
    return {
      handled: false,
      reason: "Invalid or missing reaction parameter"
    };
  }

  const route = routeReaction(reaction);
  
  if (!route) {
    return {
      handled: false,
      reason: `No route for reaction: ${reaction}`
    };
  }

  const safePayload = payload || {};

  return {
    handled: true,
    agent: route.agent,
    action: route.action,
    reaction,
    emoji: reactionToEmoji(reaction),
    issueNumber: safePayload.issue?.number || safePayload.pull_request?.number,
    repository: safePayload.repository?.full_name
  };
}

module.exports = {
  ROUTE_TYPES,
  ESCALATION_EMOJIS,
  STATUS_EMOJIS,
  STATUS_REACTIONS,
  determineEmojiRoute,
  determineReactionRoute,
  createEmojiRouteContext,
  createReactionRouteContext,
  createEmojiAgentRouter,
  routeEmoji,
  routeReaction,
  getEmojiRoutes,
  getReactionRoutes,
  reactionToEmoji,
  processReaction,
  AGENT_ROUTES,
  REACTION_ROUTES
};
