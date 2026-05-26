import { describe, expect, it } from "vitest";

import { getIndex, listManifests, loadVector, loadVectors, pathFor } from "../src/loader.js";
import { MANIFESTS } from "../src/manifest.js";

describe("manifest catalogue", () => {
  it("exposes at least 4 valid + 4 dirty + 2 shape vectors at v0.1", () => {
    const valid = MANIFESTS.filter((m) => m.category === "valid");
    const dirty = MANIFESTS.filter((m) => m.category === "dirty");
    const shape = MANIFESTS.filter((m) => m.category === "shape");
    expect(valid.length).toBeGreaterThanOrEqual(4);
    expect(dirty.length).toBeGreaterThanOrEqual(4);
    expect(shape.length).toBeGreaterThanOrEqual(2);
  });

  it("every dirty vector lists at least one expectedFindings entry", () => {
    for (const m of MANIFESTS.filter((x) => x.category === "dirty")) {
      expect(m.expectedFindings ?? []).not.toHaveLength(0);
    }
  });

  it("getIndex returns a versioned, timestamped manifest", () => {
    const idx = getIndex();
    expect(idx.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(idx.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(idx.vectors.length).toBe(MANIFESTS.length);
  });

  it("pathFor maps id + category to vectors/<category>/<id>.json", () => {
    const m = MANIFESTS.find((x) => x.id === "chat-openai-gpt-4o-mini");
    expect(m).toBeDefined();
    expect(pathFor(m!)).toMatch(/vectors[\\/]valid[\\/]chat-openai-gpt-4o-mini\.json$/);
  });
});

describe("listManifests filters", () => {
  it("filters by category", () => {
    expect(listManifests({ category: "valid" }).every((m) => m.category === "valid")).toBe(true);
    expect(listManifests({ category: "dirty" }).every((m) => m.category === "dirty")).toBe(true);
  });

  it("filters by expected finding code", () => {
    const r = listManifests({ expects: "legacy-token-attribute" });
    expect(r.length).toBeGreaterThan(0);
    for (const m of r) expect(m.expectedFindings).toContain("legacy-token-attribute");
  });

  it("filters by both category and expected finding code", () => {
    const r = listManifests({ category: "dirty", expects: "negative-token-count" });
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("negative-output-tokens");
  });

  it("returns the full set when no filter is supplied", () => {
    expect(listManifests()).toHaveLength(MANIFESTS.length);
  });
});

describe("loadVector / loadVectors", () => {
  it("loadVector returns manifest + payload with a real resourceSpans envelope", () => {
    const v = loadVector("chat-openai-gpt-4o-mini");
    expect(v.manifest.id).toBe("chat-openai-gpt-4o-mini");
    expect(v.payload).toHaveProperty("resourceSpans");
  });

  it("loadVector throws on unknown id", () => {
    expect(() => loadVector("does-not-exist")).toThrow(/unknown vector id/);
  });

  it("loadVectors returns every manifest with payload", () => {
    const all = loadVectors();
    expect(all).toHaveLength(MANIFESTS.length);
    for (const v of all) expect(v.payload).toBeDefined();
  });

  it("loadVectors honors filter", () => {
    const valid = loadVectors({ category: "valid" });
    expect(valid.every((v) => v.manifest.category === "valid")).toBe(true);
  });
});

describe("vector payload shape sanity", () => {
  it("valid vectors with spanCount>0 have at least one span attribute set", () => {
    const v = loadVector<{ resourceSpans: { scopeSpans: { spans: unknown[] }[] }[] }>(
      "chat-openai-gpt-4o-mini"
    );
    const span = v.payload.resourceSpans[0].scopeSpans[0].spans[0] as { attributes: unknown[] };
    expect(span.attributes.length).toBeGreaterThan(0);
  });

  it("empty-envelope vector parses to an empty resourceSpans array", () => {
    const v = loadVector<{ resourceSpans: unknown[] }>("empty-envelope");
    expect(v.payload.resourceSpans).toEqual([]);
  });
});
