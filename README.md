# otel-genai-test-vectors

Curated conformance corpus for the [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/). Like the [W3C trace-context test suite](https://github.com/w3c/trace-context/tree/main/test) — but for OTel GenAI.

> Status: v0.1.0 — 10 vectors across 3 categories. Node 20/22 supported.

Drop-in regression target for anyone building a GenAI consumer:

- ✅ validators (`otel-genai-validator`)
- ✅ exporters (`llm-cost-span-exporter`)
- ✅ rollups (`otel-genai-rollup`, `llm-cost-rollup-action`)
- ✅ dashboards
- ✅ collector pipelines

## What's in the corpus

| Category | Count | Description |
|---|---|---|
| `valid`  | 4 | Spec-conformant spans — a consumer should produce **no** error-severity findings. |
| `dirty`  | 4 | Deliberately violates one rule. The manifest pins which `expectedFindings` codes a validator should emit. |
| `shape`  | 2 | Envelope/structure variants — multi-resource, multi-scope, empty envelope. Consumers should walk these without crashing. |

Each vector is a self-contained OTLP/JSON file under `vectors/<category>/<id>.json`. The manifest (`src/manifest.ts`) declares what each one represents.

## Library

```ts
import { listManifests, loadVector, loadVectors } from "otel-genai-test-vectors";

// 1) Discover what's in the corpus
const dirty = listManifests({ category: "dirty" });

// 2) Load just the one you need
const { manifest, payload } = loadVector("legacy-token-attributes");
console.log(manifest.expectedFindings);  // ["legacy-token-attribute", ...]

// 3) Or sweep — run your validator against every dirty vector and assert findings match
for (const v of loadVectors({ category: "dirty" })) {
  const findings = myValidator(v.payload).map(f => f.code);
  for (const expected of v.manifest.expectedFindings ?? []) {
    assert(findings.includes(expected), `${v.manifest.id} → expected ${expected}`);
  }
}
```

## Filtering

```ts
// All vectors that exercise the legacy prompt_tokens / completion_tokens names
listManifests({ expects: "legacy-token-attribute" });

// All chat operation vectors (any category)
listManifests().filter(m => m.operations.includes("chat"));
```

## Composes with

- [**`otel-genai-validator`**](https://github.com/mizcausevic-dev/otel-genai-validator) — the validator's rule ids are exactly the `expectedFindings` codes used here.
- [**`otel-genai-rollup`**](https://github.com/mizcausevic-dev/otel-genai-rollup) and [**`llm-cost-rollup-action`**](https://github.com/mizcausevic-dev/llm-cost-rollup-action) — both consume the same envelope shape these vectors model.
- [**`llm-cost-span-exporter`**](https://github.com/mizcausevic-dev/llm-cost-span-exporter) — produces spans of the same shape.

## Develop

```
npm install
npm run lint && npm run typecheck && npm run coverage && npm run build
npm run demo
```

## Adding a vector

1. Drop the JSON under `vectors/<valid|dirty|shape>/<your-id>.json`.
2. Add a manifest entry in `src/manifest.ts` describing what it tests.
3. For `dirty` vectors, list the rule codes a validator should emit in `expectedFindings`.
4. Run `npm run test` — the test suite will load it and sanity-check shape.

## License

[AGPL-3.0-or-later](LICENSE)
