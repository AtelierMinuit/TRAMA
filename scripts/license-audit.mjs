import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const packageRoot = path.join(root, "node_modules");
const packages = new Map();

function readPackage(packageJson) {
  try {
    const value = JSON.parse(fs.readFileSync(packageJson, "utf8"));
    if (typeof value.name !== "string" || typeof value.version !== "string") return;
    const license = typeof value.license === "string"
      ? value.license
      : Array.isArray(value.licenses)
        ? value.licenses.map((item) => typeof item === "string" ? item : item?.type).filter(Boolean).join(" OR ")
        : "UNKNOWN";
    packages.set(`${value.name}@${value.version}`, { name: value.name, version: value.version, license, path: packageJson });
  } catch {
    // A package with invalid metadata is reported by the package manager; do not execute it.
  }
}

function scanPackageDirectory(directory) {
  const packageJson = path.join(directory, "package.json");
  if (packageJson === path.join(root, "package.json")) return;
  if (fs.existsSync(packageJson)) readPackage(packageJson);
}

function collectDependencyTree(node) {
  if (!node || typeof node !== "object") return;
  if (typeof node.path === "string") scanPackageDirectory(node.path);
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    for (const child of Object.values(node[field] ?? {})) collectDependencyTree(child);
  }
}

if (fs.existsSync(packageRoot)) {
  try {
    const listing = JSON.parse(execFileSync("pnpm", ["list", "--json", "--depth", "Infinity", "--prod=false"], { cwd: root, encoding: "utf8" }));
    for (const project of listing) collectDependencyTree(project);
  } catch (error) {
    console.error("No se pudo obtener el árbol de dependencias de pnpm para la auditoría.", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

const allow = new Set([
  "0BSD", "AGPL-3.0-only", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "CC0-1.0",
  "ISC", "MIT", "MPL-2.0", "Python-2.0", "Unlicense", "Zlib",
]);
const findings = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
function isApproved(item) {
  const normalized = item.license.replace(/[()]/g, "").replace(/\s+/g, " ").trim();
  if (normalized === "MIT OR SEE LICENSE IN FEEL-FREE.md") {
    return fs.existsSync(path.join(path.dirname(item.path), "FEEL-FREE.md"));
  }
  return normalized.split(/\s+(?:OR|AND)\s+/).every((part) => allow.has(part.trim()));
}
const unknown = findings.filter((item) => !isApproved(item));
console.log(`TRAMA dependency license audit: ${findings.length} packages inspected`);
for (const item of findings) console.log(`${item.name}@${item.version}\t${item.license}`);
if (unknown.length) {
  console.error(`\nLicencias no aprobadas o no declaradas: ${unknown.length}`);
  for (const item of unknown) console.error(`- ${item.name}@${item.version}: ${item.license}`);
  process.exitCode = 1;
}
