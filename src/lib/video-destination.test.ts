import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Video uses its canonical v20 route and keeps Cinema as a redirect only", async () => {
  const canonicalPage = await readFile("src/app/entertainment/video/page.tsx", "utf8");
  const legacyPage = await readFile("src/app/entertainment/cinema/page.tsx", "utf8");
  assert.match(canonicalPage, /canonical:\s*"\/entertainment\/video"/);
  assert.match(legacyPage, /permanentRedirect\("\/entertainment\/video"\)/);
});

test("Video describes accessibility and failure behavior without exposing a premature player", async () => {
  const source = await readFile("src/components/VideoDestination.tsx", "utf8");
  for (const required of ["Coming soon", "Captions", "transcript", "age guidance", "While video loads", "If playback is interrupted"]) {
    assert.match(source.toLowerCase(), new RegExp(required.toLowerCase()), required);
  }
  assert.doesNotMatch(source, /<video\b/i);
  assert.doesNotMatch(source, /<button[^>]*>\s*play/i);
});

test("Video copy does not use Film as a public category", async () => {
  const sources = await Promise.all([
    readFile("src/components/VideoDestination.tsx", "utf8"),
    readFile("src/lib/media-catalog.ts", "utf8"),
    readFile("src/app/entertainment/video/page.tsx", "utf8"),
    readFile("src/app/entertainment/page.tsx", "utf8"),
    readFile("src/components/PublicHome.tsx", "utf8"),
  ]);
  assert.doesNotMatch(sources.join("\n"), /\bfilms?\b/i);
});
