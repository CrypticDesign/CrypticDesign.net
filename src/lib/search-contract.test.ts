import assert from "node:assert/strict";
import test from "node:test";
import { resolvePublicSearch, searchPublicRecords, type PublicSearchRecord } from "./search-contract.ts";

const records: PublicSearchRecord[] = [
  {
    id: "world:singularis",
    category: "world",
    title: "Singularis",
    summary: "A near-future transmedia universe.",
    href: "/products/singularis",
    keywords: ["science fiction", "game"],
    availability: "preview",
    access: "public",
  },
  {
    id: "service:ux-interaction",
    category: "service",
    title: "UX & Interaction",
    summary: "Clear, learnable interactions for complex systems.",
    href: "/professional/ux-interaction",
    keywords: ["design", "accessibility"],
    availability: "available",
    access: "public",
  },
];

test("empty, unavailable, and deferred search states remain explicit and fail closed", () => {
  assert.equal(resolvePublicSearch("   ", records).state, "empty");
  assert.equal(resolvePublicSearch("singularis", records, "unavailable").state, "unavailable");
  assert.equal(resolvePublicSearch("singularis", records, "deferred").state, "deferred");
  assert.deepEqual(resolvePublicSearch("singularis", records, "unavailable").results, []);
});

test("local matching covers titles, summaries, categories, and approved keywords", () => {
  assert.equal(searchPublicRecords("singularis", records)[0]?.id, "world:singularis");
  assert.equal(searchPublicRecords("transmedia universe", records)[0]?.id, "world:singularis");
  assert.equal(searchPublicRecords("accessibility", records)[0]?.id, "service:ux-interaction");
  assert.equal(searchPublicRecords("service", records)[0]?.id, "service:ux-interaction");
});

test("matching is normalized and preserves truthful availability labels", () => {
  const result = resolvePublicSearch("  UX interaction  ", records);
  assert.equal(result.state, "results");
  assert.equal(result.query, "UX interaction");
  assert.equal(result.results[0]?.availability, "available");
});

test("unknown terms return not-found without suggesting private content", () => {
  const result = resolvePublicSearch("private member dossier", records);
  assert.equal(result.state, "not-found");
  assert.deepEqual(result.results, []);
  assert.match(result.message, /No public local results/);
});
