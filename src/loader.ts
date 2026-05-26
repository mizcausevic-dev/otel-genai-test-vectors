import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { INDEX, MANIFESTS } from "./manifest.js";
import type { FindingCode, LoadedVector, VectorCategory, VectorIndex, VectorManifest } from "./types.js";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the on-disk path to a vector JSON file. Exposed so callers using
 * non-fs runtimes (bundlers, fetch-based loaders) can wire it themselves.
 */
export function pathFor(manifest: VectorManifest): string {
  // src/ at runtime is dist/, so vectors/ is one level up.
  return resolve(HERE, "..", "vectors", manifest.category, `${manifest.id}.json`);
}

/** Return every manifest, optionally filtered. */
export function listManifests(filter?: {
  category?: VectorCategory;
  expects?: FindingCode;
}): VectorManifest[] {
  return MANIFESTS.filter((m) => {
    if (filter?.category && m.category !== filter.category) return false;
    if (filter?.expects && !(m.expectedFindings ?? []).includes(filter.expects)) return false;
    return true;
  });
}

/** Load a single vector by id. Throws when the id is unknown. */
export function loadVector<T = unknown>(id: string): LoadedVector<T> {
  const manifest = MANIFESTS.find((m) => m.id === id);
  if (!manifest) throw new Error(`unknown vector id: "${id}". Available: ${MANIFESTS.map((m) => m.id).join(", ")}`);
  const payload = JSON.parse(readFileSync(pathFor(manifest), "utf8")) as T;
  return { manifest, payload };
}

/** Load every vector matching the filter (or all). */
export function loadVectors<T = unknown>(filter?: {
  category?: VectorCategory;
  expects?: FindingCode;
}): LoadedVector<T>[] {
  return listManifests(filter).map((m) => loadVector<T>(m.id));
}

/** Return the static index (version + generation timestamp + all manifests). */
export function getIndex(): VectorIndex {
  return INDEX;
}
