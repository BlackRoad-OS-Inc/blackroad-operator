/**
 * Digest Generator
 *
 * Generates text digests from PR metadata using a template-based approach.
 * Uses the Codex digest agent prompt for consistent formatting.
 */

import type { PRMetadata, DigestContent } from "./types";
import * as fs from "fs";
import * as path from "path";

/**
 * Loads the Codex digest agent prompt template
 *
 * @returns The prompt template string
 */
export function loadPromptTemplate(): string {
  const promptPath = path.join(__dirname, "codex-digest-agent.prompt.txt");

  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, "utf-8");
  }

  // Fallback template if file not found
  return getDefaultPromptTemplate();
}

/**
 * Returns the default prompt template
 */
function getDefaultPromptTemplate(): string {
  return `Generate a voice-friendly summary for PR #{{number}} titled "{{title}}" by {{author}} in {{owner}}/{{repo}}.`;
}

/**
 * Replaces template placeholders with actual values
 *
 * @param template - Template string with {{placeholders}}
 * @param metadata - PR metadata values
 * @returns Filled template string
 */
export function fillTemplate(template: string, metadata: PRMetadata): string {
  return template
    .replace(/\{\{title\}\}/g, metadata.title)
    .replace(/\{\{author\}\}/g, metadata.author)
    .replace(/\{\{owner\}\}/g, metadata.owner)
    .replace(/\{\{repo\}\}/g, metadata.repo)
    .replace(/\{\{number\}\}/g, String(metadata.number))
    .replace(/\{\{url\}\}/g, metadata.url)
    .replace(/\{\{createdAt\}\}/g, metadata.createdAt)
    .replace(/\{\{body\}\}/g, metadata.body || "No description provided")
    .replace(
      /\{\{filesChanged\}\}/g,
      metadata.filesChanged?.join(", ") || "Not specified"
    )
    .replace(
      /\{\{labels\}\}/g,
      metadata.labels?.join(", ") || "None"
    );
}

/**
 * Generates a digest from PR metadata
 *
 * This creates a voice-friendly summary suitable for text-to-speech.
 *
 * @param metadata - PR metadata
 * @returns Generated digest content
 */
export function generateDigest(metadata: PRMetadata): DigestContent {
  const text = createDigestText(metadata);

  return {
    text,
    metadata,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Creates the digest text from PR metadata
 *
 * @param metadata - PR metadata
 * @returns Voice-friendly digest text
 */
export function createDigestText(metadata: PRMetadata): string {
  const parts: string[] = [];

  // Opening
  parts.push(
    `A new pull request has been opened by ${metadata.author} in the ${metadata.owner}/${metadata.repo} repository.`
  );

  // Title and description
  parts.push(`PR number ${metadata.number} is titled "${metadata.title}".`);

  // Body summary (if available)
  if (metadata.body && metadata.body.trim()) {
    const summary = summarizeBody(metadata.body);
    if (summary) {
      parts.push(summary);
    }
  }

  // Files changed
  if (metadata.filesChanged && metadata.filesChanged.length > 0) {
    const fileCount = metadata.filesChanged.length;
    if (fileCount === 1) {
      parts.push(`This change affects 1 file.`);
    } else {
      parts.push(`This change affects ${fileCount} files.`);
    }
  }

  // Labels
  if (metadata.labels && metadata.labels.length > 0) {
    const labelText = metadata.labels.join(", ");
    parts.push(`Labels: ${labelText}.`);
  }

  // Closing
  parts.push(`You can view the full details on GitHub.`);

  return parts.join(" ");
}

/**
 * Summarizes a PR body to a voice-friendly length
 *
 * @param body - Full PR body text
 * @returns Summarized text suitable for voice
 */
export function summarizeBody(body: string): string {
  // Remove markdown formatting
  let cleaned = body
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/- \[[ x]\]/g, "") // Remove checkboxes
    .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
    .replace(/\n+/g, " ") // Collapse newlines
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  // Truncate to reasonable length for voice
  if (cleaned.length > 200) {
    // Find a good breaking point
    const truncated = cleaned.substring(0, 200);
    const lastSentence = truncated.lastIndexOf(".");
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSentence > 100) {
      cleaned = truncated.substring(0, lastSentence + 1);
    } else if (lastSpace > 100) {
      cleaned = truncated.substring(0, lastSpace) + "...";
    } else {
      cleaned = truncated + "...";
    }
  }

  return cleaned;
}

/**
 * Validates PR metadata for digest generation
 *
 * @param metadata - Metadata to validate
 * @returns true if valid, throws error otherwise
 */
export function validateMetadata(metadata: PRMetadata): boolean {
  if (!metadata.number || metadata.number <= 0) {
    throw new Error("Valid PR number is required");
  }

  if (!metadata.title || !metadata.title.trim()) {
    throw new Error("PR title is required");
  }

  if (!metadata.author || !metadata.author.trim()) {
    throw new Error("PR author is required");
  }

  if (!metadata.owner || !metadata.owner.trim()) {
    throw new Error("Repository owner is required");
  }

  if (!metadata.repo || !metadata.repo.trim()) {
    throw new Error("Repository name is required");
  }

  return true;
}
