import type { VectorIndex, VectorManifest } from "./types.js";

/** Static manifest for every vector shipped in the corpus (v0.1). */
export const MANIFESTS: VectorManifest[] = [
  // ─── valid ────────────────────────────────────────────────────────────────
  {
    id: "chat-openai-gpt-4o-mini",
    category: "valid",
    description: "Conformant single chat span (OpenAI, gpt-4o-mini) with request + response model and token usage.",
    operations: ["chat"],
    spanCount: 1
  },
  {
    id: "embeddings-openai-text-embedding-3-small",
    category: "valid",
    description: "Conformant embeddings span; output_tokens=0 is valid for embeddings calls.",
    operations: ["embeddings"],
    spanCount: 1
  },
  {
    id: "chat-anthropic-claude-opus",
    category: "valid",
    description: "Conformant chat span on a different provider (Anthropic).",
    operations: ["chat"],
    spanCount: 1
  },
  {
    id: "execute-tool-internal",
    category: "valid",
    description: "execute_tool operation with kind=INTERNAL — the spec allows INTERNAL for tool execution.",
    notes: "Consumers should not flag INTERNAL kind as unexpected for GenAI spans.",
    operations: ["execute_tool"],
    spanCount: 1
  },

  // ─── dirty ────────────────────────────────────────────────────────────────
  {
    id: "missing-provider-name",
    category: "dirty",
    description: "gen_ai.provider.name attribute is absent.",
    operations: ["chat"],
    spanCount: 1,
    expectedFindings: ["missing-provider-name"]
  },
  {
    id: "legacy-token-attributes",
    category: "dirty",
    description: "Uses the renamed-away gen_ai.usage.prompt_tokens / completion_tokens attribute names.",
    operations: ["chat"],
    spanCount: 1,
    expectedFindings: ["legacy-token-attribute", "missing-usage-input-tokens", "missing-usage-output-tokens"]
  },
  {
    id: "negative-output-tokens",
    category: "dirty",
    description: "gen_ai.usage.output_tokens is a negative value (-1).",
    operations: ["chat"],
    spanCount: 1,
    expectedFindings: ["negative-token-count"]
  },
  {
    id: "unknown-operation-name",
    category: "dirty",
    description: "gen_ai.operation.name is not in the well-known set.",
    operations: ["chat"],
    spanCount: 1,
    expectedFindings: ["unknown-operation-name"]
  },

  // ─── shape ────────────────────────────────────────────────────────────────
  {
    id: "multi-resource-multi-scope",
    category: "shape",
    description: "Two resourceSpans, multiple scopeSpans per resource, three spans total — exercises the full envelope walk.",
    operations: ["chat", "embeddings"],
    spanCount: 3
  },
  {
    id: "empty-envelope",
    category: "shape",
    description: "Empty resourceSpans array — consumers should treat as 0 spans, not as an error.",
    operations: [],
    spanCount: 0
  }
];

export const INDEX: VectorIndex = {
  version: "0.1.0",
  generatedAt: "2026-05-27T00:00:00Z",
  vectors: MANIFESTS
};
