import { readFileSync, writeFileSync } from "node:fs";

const pkgPath = process.argv[2] ?? "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const version = pkg.version ?? "0.0.0";
const [major, minor, patch] = version.split(".").map(Number);
const nextVersion = [major, minor, (patch ?? 0) + 1].join(".");

pkg.version = nextVersion;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Bumped ${pkgPath} to ${nextVersion}`);
