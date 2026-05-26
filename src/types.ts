// Conformance test vectors for OpenTelemetry GenAI span consumers.
// Each vector is a self-contained OTLP/JSON payload plus a declarative manifest
// describing what it represents, so a consumer (validator, exporter, rollup,
// dashboard, etc.) can use it as a regression target.

/** Operation set per the OTel GenAI semconv. */
export type GenAiOperation =
  | "chat"
  | "generate_content"
  | "text_completion"
  | "embeddings"
  | "retrieval"
  | "execute_tool"
  | "create_agent"
  | "invoke_agent"
  | "invoke_workflow";

/**
 * Top-level category of a fixture:
 * - `valid`   — spec-conformant; a consumer should produce no errors.
 * - `dirty`   — deliberately violates one rule. The `expectedFindings` list pins which.
 * - `shape`   — exercises envelope/structure variations (multi-resource, multi-scope, …).
 */
export type VectorCategory = "valid" | "dirty" | "shape";

/** Diagnostic codes a consumer may emit. Mirrors otel-genai-validator's rule ids. */
export type FindingCode =
  | "missing-provider-name"
  | "missing-operation-name"
  | "unknown-operation-name"
  | "missing-request-model"
  | "missing-usage-input-tokens"
  | "missing-usage-output-tokens"
  | "legacy-token-attribute"
  | "unexpected-span-kind"
  | "span-name-mismatch"
  | "negative-token-count";

export interface VectorManifest {
  /** Stable id, also the file stem under vectors/<category>/<id>.json. */
  id: string;
  category: VectorCategory;
  /** One-line description of what the vector exercises. */
  description: string;
  /** Optional notes: links to OTel spec sections, edge cases. */
  notes?: string;
  /** GenAI operations represented in the payload (for filtering). */
  operations: GenAiOperation[];
  /** Number of spans in the payload, for quick filtering. */
  spanCount: number;
  /** For `dirty` vectors: which rule violations are expected. */
  expectedFindings?: FindingCode[];
}

/** Loaded vector — manifest + raw OTLP/JSON envelope. */
export interface LoadedVector<T = unknown> {
  manifest: VectorManifest;
  payload: T;
}

/** Index of all vectors shipped in the corpus. */
export interface VectorIndex {
  version: string;
  generatedAt: string;
  vectors: VectorManifest[];
}
