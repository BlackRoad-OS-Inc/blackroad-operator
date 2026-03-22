import fg from "fast-glob";
import { readFile } from "node:fs/promises";

export type LocalManifest = {
  path: string;
  content: string;
};

const DEFAULT_PATTERN = "/data/agents/*.yaml";

export async function listFilesystemManifests(pattern: string = DEFAULT_PATTERN): Promise<LocalManifest[]> {
  try {
    const files = await fg(pattern, { onlyFiles: true, absolute: true });
    const manifests = await Promise.all(
      files.map(async (file) => ({
        path: file,
        content: await readFile(file, "utf-8"),
      }))
    );

    return manifests;
  } catch (error) {
    console.warn("Unable to read local manifests", error);
    return [];
  }
}
