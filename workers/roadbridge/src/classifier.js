/**
 * roadbridge — Layer 2: Event classifier and router
 *
 * Classifies inbound GitHub/Drive events into artifact types and determines
 * the correct destination and transformation. This is the rule-based fallback
 * classifier; the LLM classifier on olympia (Pi 4B) is Layer 2 extension.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

/**
 * @typedef {'release_artifact'|'memory_journal'|'roadchain_entry'|'design_asset'|'source_code'|'agent_report'|'strategy_doc'|'unknown'} ArtifactType
 *
 * @typedef {'github_to_drive'|'drive_to_github'} Direction
 *
 * @typedef {Object} RouteDecision
 * @property {ArtifactType} artifactType
 * @property {Direction} direction
 * @property {string} drivePath  - Target Drive folder path template
 * @property {string} githubPath - Target GitHub path (for Drive→GitHub)
 * @property {string} transformation - Transformation to apply
 * @property {boolean} witness - Whether to witness to roadchain
 * @property {string} classifierSource - 'rule-based' or 'llm'
 */

/**
 * Classify a GitHub event and produce a route decision.
 * @param {string} eventType - GitHub event type (push, release, pull_request, etc.)
 * @param {object} payload - GitHub webhook payload
 * @returns {RouteDecision}
 */
export function classifyGitHubEvent(eventType, payload) {
  // Release published → stream build artifacts to Drive
  if (eventType === 'release' && payload.action === 'published') {
    const repo = payload.repository?.name || 'unknown';
    const tag = payload.release?.tag_name || 'latest';
    return {
      artifactType: 'release_artifact',
      direction: 'github_to_drive',
      drivePath: `/releases/${repo}/${tag}/`,
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  // Push events require inspecting the commit paths
  if (eventType === 'push') {
    return classifyPushEvent(payload);
  }

  // PR merged with design assets
  if (
    eventType === 'pull_request' &&
    payload.action === 'closed' &&
    payload.pull_request?.merged
  ) {
    const repo = payload.repository?.name || 'unknown';
    const org = payload.repository?.owner?.login || 'unknown';
    return {
      artifactType: 'design_asset',
      direction: 'github_to_drive',
      drivePath: `/assets/${org}/${repo}/`,
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  return unknownRoute();
}

/**
 * Classify a push event based on modified file paths.
 * @param {object} payload - GitHub push webhook payload
 * @returns {RouteDecision}
 */
function classifyPushEvent(payload) {
  const commits = payload.commits || [];
  const allPaths = commits.flatMap((c) => [
    ...(c.added || []),
    ...(c.modified || []),
  ]);

  // Lucidia memory journal detection
  const isMemoryRepo =
    payload.repository?.name?.includes('lucidia') ||
    payload.repository?.name?.includes('memory');
  const hasJournalPaths = allPaths.some(
    (p) =>
      p.includes('journal') || p.includes('memory/') || p.endsWith('.jsonl'),
  );

  if (isMemoryRepo && hasJournalPaths) {
    const date = new Date().toISOString().split('T')[0];
    return {
      artifactType: 'memory_journal',
      direction: 'github_to_drive',
      drivePath: `/lucidia/journals/${date}.gdoc`,
      githubPath: '',
      transformation: 'journal_to_doc',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  // Roadchain entry detection
  const hasRoadchainPaths = allPaths.some(
    (p) =>
      p.includes('roadchain') || p.includes('ledger') || p.includes('audit'),
  );

  if (hasRoadchainPaths) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return {
      artifactType: 'roadchain_entry',
      direction: 'github_to_drive',
      drivePath: `/roadchain/audit/${year}/${month}/`,
      githubPath: '',
      transformation: 'block_to_doc',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  // Agent reports in reports/ directory
  const hasReportPaths = allPaths.some((p) => p.startsWith('reports/'));
  if (hasReportPaths) {
    const repo = payload.repository?.name || 'unknown';
    return {
      artifactType: 'agent_report',
      direction: 'github_to_drive',
      drivePath: `/reports/${repo}/`,
      githubPath: '',
      transformation: 'none',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  // Default: source code push — no Drive sync unless configured
  return {
    artifactType: 'source_code',
    direction: 'github_to_drive',
    drivePath: '',
    githubPath: '',
    transformation: 'none',
    witness: false,
    classifierSource: 'rule-based',
  };
}

/**
 * Classify a Google Drive event and produce a route decision.
 * @param {string} changeType - 'created' | 'modified' | 'deleted'
 * @param {object} fileMetadata - Drive file metadata
 * @returns {RouteDecision}
 */
export function classifyDriveEvent(changeType, fileMetadata) {
  const mimeType = fileMetadata.mimeType || '';
  const name = fileMetadata.name || '';
  const parents = fileMetadata.parents || [];

  // Agent report created in Drive → commit to GitHub
  if (
    changeType === 'created' &&
    (name.toLowerCase().includes('report') ||
      name.toLowerCase().includes('agent'))
  ) {
    const date = new Date().toISOString().split('T')[0];
    return {
      artifactType: 'agent_report',
      direction: 'drive_to_github',
      drivePath: '',
      githubPath: `/reports/${sanitizeFilename(name)}/${date}.md`,
      transformation: 'doc_to_markdown',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  // Strategy/planning doc modified → open PR
  if (
    changeType === 'modified' &&
    mimeType === 'application/vnd.google-apps.document'
  ) {
    return {
      artifactType: 'strategy_doc',
      direction: 'drive_to_github',
      drivePath: '',
      githubPath: `/knowledge/${sanitizeFilename(name)}.md`,
      transformation: 'doc_to_markdown',
      witness: true,
      classifierSource: 'rule-based',
    };
  }

  return unknownRoute();
}

/**
 * Check whether a route should be executed based on .roadbridge.yml config.
 * @param {RouteDecision} route
 * @param {object|null} repoConfig - Parsed .roadbridge.yml from the repo
 * @returns {boolean}
 */
export function shouldExecuteRoute(route, repoConfig) {
  // No config means inherit defaults — execute all witnessed routes
  if (!repoConfig) return route.witness;

  // Check exclusion patterns
  if (repoConfig.drive?.exclude) {
    const excluded = repoConfig.drive.exclude.some((pattern) =>
      matchGlob(route.drivePath || route.githubPath, pattern),
    );
    if (excluded) return false;
  }

  // Check specific event toggles
  if (route.artifactType === 'release_artifact') {
    return repoConfig.drive?.on_release !== false;
  }

  return route.witness;
}

function unknownRoute() {
  return {
    artifactType: 'unknown',
    direction: 'github_to_drive',
    drivePath: '',
    githubPath: '',
    transformation: 'none',
    witness: false,
    classifierSource: 'rule-based',
  };
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9_\-. ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Simple glob matcher for exclusion patterns.
 * Supports * and ** wildcards.
 * @param {string} path
 * @param {string} pattern
 * @returns {boolean}
 */
function matchGlob(path, pattern) {
  // Replace glob wildcards with placeholders so we can safely escape regex metacharacters.
  const withPlaceholders = pattern
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '<<<GLOB>>>');

  // Escape all regex metacharacters, then restore our glob placeholders.
  const escaped = escapeRegex(withPlaceholders);
  const regex = escaped
    .replace(/<<<GLOBSTAR>>>/g, '.*')
    .replace(/<<<GLOB>>>/g, '[^/]*');

  return new RegExp(`^${regex}$`).test(path);
}

/**
 * Escape regex metacharacters in a string so it can be used to build a RegExp.
 * This is used by matchGlob to ensure that only * and ** act as wildcards.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
