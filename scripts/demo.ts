import { getIndex, listManifests, loadVector } from "../src/loader.js";

const idx = getIndex();
console.log(`otel-genai-test-vectors v${idx.version} — ${idx.vectors.length} vectors`);
console.log("");
for (const cat of ["valid", "dirty", "shape"] as const) {
  const ms = listManifests({ category: cat });
  console.log(`## ${cat} (${ms.length})`);
  for (const m of ms) {
    const expected = m.expectedFindings?.length ? `   ← ${m.expectedFindings.join(", ")}` : "";
    console.log(`  - ${m.id} (${m.spanCount} span${m.spanCount === 1 ? "" : "s"})${expected}`);
  }
  console.log("");
}

const sample = loadVector("legacy-token-attributes");
const span =
  (sample.payload as { resourceSpans: { scopeSpans: { spans: { attributes: { key: string }[] }[] }[] }[] })
    .resourceSpans[0].scopeSpans[0].spans[0];
console.log(`example "legacy-token-attributes" attribute keys:`);
console.log(span.attributes.map((a) => `  ${a.key}`).join("\n"));
