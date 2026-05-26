# Changelog

## v0.1.0 — 2026-05-27

- Initial release: curated conformance corpus for the OpenTelemetry GenAI semantic conventions.
- 10 vectors across 3 categories — 4 valid, 4 dirty (each pinning the rule violation a validator should report), 2 shape (envelope walks: multi-resource/multi-scope and empty).
- Operations covered: chat (OpenAI, Anthropic), embeddings, execute_tool (kind=INTERNAL).
- Library API: `getIndex()`, `listManifests(filter?)`, `loadVector(id)`, `loadVectors(filter?)`, `pathFor(manifest)`. Filter on `category` and/or `expects` (FindingCode).
- Designed as a drop-in regression target for `otel-genai-validator`, `otel-genai-rollup`, `llm-cost-span-exporter`, `llm-cost-rollup-action`, and any other GenAI consumer.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
