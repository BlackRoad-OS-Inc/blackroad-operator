import { describe, expect, it, vi } from "vitest";
import {
  generateDigest,
  createDigestText,
  summarizeBody,
  validateMetadata,
  fillTemplate,
} from "../src/digest/digest-generator";
import type { PRMetadata } from "../src/digest/types";

const sampleMetadata: PRMetadata = {
  number: 42,
  title: "Add voice digest feature",
  body: "This PR introduces a new voice digest module that generates audio summaries.",
  author: "test-user",
  owner: "test-org",
  repo: "test-repo",
  url: "https://github.com/test-org/test-repo/pull/42",
  createdAt: "2024-01-15T10:00:00Z",
  filesChanged: ["src/digest/index.ts", "src/digest/types.ts"],
  labels: ["feature", "voice"],
};

describe("generateDigest", () => {
  it("generates a digest with correct structure", () => {
    const digest = generateDigest(sampleMetadata);

    expect(digest.text).toBeDefined();
    expect(digest.text.length).toBeGreaterThan(0);
    expect(digest.metadata).toEqual(sampleMetadata);
    expect(digest.generatedAt).toBeDefined();
  });

  it("includes author and repo in the digest text", () => {
    const digest = generateDigest(sampleMetadata);

    expect(digest.text).toContain("test-user");
    expect(digest.text).toContain("test-org/test-repo");
  });

  it("includes PR number and title", () => {
    const digest = generateDigest(sampleMetadata);

    expect(digest.text).toContain("42");
    expect(digest.text).toContain("Add voice digest feature");
  });
});

describe("createDigestText", () => {
  it("creates text mentioning the author", () => {
    const text = createDigestText(sampleMetadata);
    expect(text).toContain("test-user");
  });

  it("creates text mentioning files changed count", () => {
    const text = createDigestText(sampleMetadata);
    expect(text).toContain("2 files");
  });

  it("handles single file change", () => {
    const metadata = { ...sampleMetadata, filesChanged: ["single-file.ts"] };
    const text = createDigestText(metadata);
    expect(text).toContain("1 file");
  });

  it("handles no files changed", () => {
    const metadata = { ...sampleMetadata, filesChanged: undefined };
    const text = createDigestText(metadata);
    expect(text).not.toContain("files");
  });

  it("includes labels when present", () => {
    const text = createDigestText(sampleMetadata);
    expect(text).toContain("feature");
    expect(text).toContain("voice");
  });

  it("handles no labels", () => {
    const metadata = { ...sampleMetadata, labels: undefined };
    const text = createDigestText(metadata);
    expect(text).not.toContain("Labels:");
  });
});

describe("summarizeBody", () => {
  it("returns empty string for empty body", () => {
    expect(summarizeBody("")).toBe("");
    expect(summarizeBody("   ")).toBe("");
  });

  it("removes code blocks", () => {
    const body = "Some text ```code block``` more text";
    const result = summarizeBody(body);
    expect(result).not.toContain("```");
    expect(result).toContain("Some text");
    expect(result).toContain("more text");
  });

  it("converts markdown links to text", () => {
    const body = "Check out [this link](https://example.com)";
    const result = summarizeBody(body);
    expect(result).toContain("this link");
    expect(result).not.toContain("https://example.com");
  });

  it("removes bold and italic formatting", () => {
    const body = "This is **bold** and *italic* text";
    const result = summarizeBody(body);
    expect(result).toContain("bold");
    expect(result).toContain("italic");
    expect(result).not.toContain("**");
    expect(result).not.toContain("*");
  });

  it("truncates long text", () => {
    const longBody = "A".repeat(500);
    const result = summarizeBody(longBody);
    expect(result.length).toBeLessThanOrEqual(210); // 200 + "..." 
  });
});

describe("validateMetadata", () => {
  it("passes for valid metadata", () => {
    expect(() => validateMetadata(sampleMetadata)).not.toThrow();
    expect(validateMetadata(sampleMetadata)).toBe(true);
  });

  it("throws for missing PR number", () => {
    const invalid = { ...sampleMetadata, number: 0 };
    expect(() => validateMetadata(invalid)).toThrow("PR number");
  });

  it("throws for missing title", () => {
    const invalid = { ...sampleMetadata, title: "" };
    expect(() => validateMetadata(invalid)).toThrow("title");
  });

  it("throws for missing author", () => {
    const invalid = { ...sampleMetadata, author: "" };
    expect(() => validateMetadata(invalid)).toThrow("author");
  });

  it("throws for missing owner", () => {
    const invalid = { ...sampleMetadata, owner: "" };
    expect(() => validateMetadata(invalid)).toThrow("owner");
  });

  it("throws for missing repo", () => {
    const invalid = { ...sampleMetadata, repo: "" };
    expect(() => validateMetadata(invalid)).toThrow("Repository name");
  });
});

describe("fillTemplate", () => {
  it("replaces placeholders with values", () => {
    const template = "PR #{{number}} by {{author}}";
    const result = fillTemplate(template, sampleMetadata);
    expect(result).toBe("PR #42 by test-user");
  });

  it("handles all placeholder types", () => {
    const template =
      "{{title}} in {{owner}}/{{repo}} at {{url}} created {{createdAt}}";
    const result = fillTemplate(template, sampleMetadata);

    expect(result).toContain("Add voice digest feature");
    expect(result).toContain("test-org/test-repo");
    expect(result).toContain("https://github.com/test-org/test-repo/pull/42");
  });

  it("handles missing body", () => {
    const template = "Body: {{body}}";
    const metadata = { ...sampleMetadata, body: null };
    const result = fillTemplate(template, metadata);
    expect(result).toBe("Body: No description provided");
  });

  it("handles files and labels", () => {
    const template = "Files: {{filesChanged}}, Labels: {{labels}}";
    const result = fillTemplate(template, sampleMetadata);
    expect(result).toContain("src/digest/index.ts");
    expect(result).toContain("feature, voice");
  });
});
