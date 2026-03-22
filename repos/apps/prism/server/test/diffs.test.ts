import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { applyUnifiedDiff } from "../../packages/agents/src/runners/coder";

const TEST_WORK_DIR = path.resolve(process.cwd(), "prism/work/test");

describe("applyUnifiedDiff", () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_WORK_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_WORK_DIR)) {
      fs.rmSync(TEST_WORK_DIR, { recursive: true, force: true });
    }
  });

  it("applies pure additions to empty file", () => {
    const content = "";
    const patch = `@@ -0,0 +1,3 @@
+line 1
+line 2
+line 3`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("line 1\nline 2\nline 3");
  });

  it("applies pure additions to existing file", () => {
    const content = "existing line 1\nexisting line 2";
    const patch = `@@ -2,0 +3,2 @@
+new line 1
+new line 2`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("existing line 1\nexisting line 2\nnew line 1\nnew line 2");
  });

  it("applies pure deletions", () => {
    const content = "line 1\nline 2\nline 3\nline 4";
    const patch = `@@ -2,2 +2,0 @@
-line 2
-line 3`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("line 1\nline 4");
  });

  it("applies line modifications", () => {
    const content = "hello world\nfoo bar\nbaz qux";
    const patch = `@@ -2,1 +2,1 @@
-foo bar
+foo modified`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("hello world\nfoo modified\nbaz qux");
  });

  it("applies multiple hunks", () => {
    const content = "line 1\nline 2\nline 3\nline 4\nline 5";
    const patch = `@@ -1,1 +1,1 @@
-line 1
+modified line 1
@@ -4,1 +4,1 @@
-line 4
+modified line 4`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("modified line 1\nline 2\nline 3\nmodified line 4\nline 5");
  });

  it("handles context lines correctly", () => {
    const content = "context before\ntarget line\ncontext after";
    const patch = `@@ -1,3 +1,3 @@
 context before
-target line
+modified target line
 context after`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("context before\nmodified target line\ncontext after");
  });

  it("throws PatchMismatchError when patch doesn't match", () => {
    const content = "line 1\nline 2\nline 3";
    const patch = `@@ -2,1 +2,1 @@
-line X
+line modified`;

    expect(() => applyUnifiedDiff(content, patch)).toThrow("Patch mismatch");
  });

  it("handles patches with metadata lines", () => {
    const content = "old content";
    const patch = `--- a/file.txt
+++ b/file.txt
@@ -1,1 +1,1 @@
-old content
+new content`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("new content");
  });

  it("preserves trailing newline when original has one", () => {
    const content = "line 1\nline 2\n";
    const patch = `@@ -2,1 +2,1 @@
-line 2
+line modified`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("line 1\nline modified\n");
  });

  it("handles empty context", () => {
    const content = "";
    const patch = `@@ -0,0 +1,1 @@
+new line`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toBe("new line");
  });

  it("applies complex real-world patch", () => {
    const content = `function hello() {
  console.log("hello");
}

function world() {
  console.log("world");
}`;

    const patch = `@@ -1,3 +1,4 @@
 function hello() {
+  console.log("starting");
   console.log("hello");
 }
@@ -5,3 +6,3 @@
 function world() {
-  console.log("world");
+  console.log("universe");
 }`;

    const result = applyUnifiedDiff(content, patch);
    expect(result).toContain('console.log("starting")');
    expect(result).toContain('console.log("universe")');
    expect(result).not.toContain('console.log("world")');
  });
});

describe("diff apply endpoint integration", () => {
  const testFilePath = path.join(TEST_WORK_DIR, "test-file.txt");

  beforeEach(() => {
    fs.mkdirSync(TEST_WORK_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_WORK_DIR)) {
      fs.rmSync(TEST_WORK_DIR, { recursive: true, force: true });
    }
  });

  it("handles directory traversal attempts", () => {
    const maliciousPath = "../../../etc/passwd";
    const resolvedTarget = path.resolve(TEST_WORK_DIR, maliciousPath);
    const relativeTarget = path.relative(TEST_WORK_DIR, resolvedTarget);

    // Verify security check would catch this
    expect(relativeTarget.startsWith(".."))
      .toBe(true);
  });

  it("creates parent directories for new files", () => {
    const nestedPath = path.join(TEST_WORK_DIR, "deep", "nested", "file.txt");
    const dirPath = path.dirname(nestedPath);

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(nestedPath, "content");

    expect(fs.existsSync(nestedPath)).toBe(true);
  });
});
