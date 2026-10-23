import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const component = read("../components/RootPageHero.tsx");
const styles = read("../components/RootPageHero.module.css");

test("all public roots use the shared v20 hero without replacing current page copy", () => {
  for (const [file, scene] of [
    ["../components/PublicHome.tsx", "public-home"],
    ["../app/entertainment/page.tsx", "entertainment"],
    ["../app/community/page.tsx", "community"],
    ["../app/professional/page.tsx", "professional"],
  ]) {
    const source = read(file);
    assert.equal(source.match(/<RootPageHero\b/g)?.length, 1, file);
    assert.match(source, new RegExp(`sceneId="${scene}"`));
    assert.doesNotMatch(source, /<PageScene|<ExperienceRuntime/);
  }
});

test("the shared hero delegates fullscreen to the current ExperienceRuntime", () => {
  assert.match(component, /<ExperienceRuntime/);
  assert.match(component, /launchMode="fullscreen"/);
  assert.match(component, /runtimeId=\{`cryptic-design:\$\{sceneId\}:v1`\}/);
  assert.doesNotMatch(component, /<dialog|showModal|document\.body\.style\.overflow/);
});

test("copy and optional status stay in responsive document flow", () => {
  assert.match(component, /data-hero-copy/);
  assert.match(component, /data-hero-status/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\) minmax\(300px, 360px\)/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /\.status > aside \{[\s\S]*?position: static/);
  assert.doesNotMatch(styles, /padding-top: (?:285|300|310)px/);
});

test("Community keeps its truthful status while other roots do not invent one", () => {
  const community = read("../app/community/page.tsx");
  assert.match(community, /status=\{<CommunityAvailabilityPanel showSignInAction=\{false\} \/>\}/);
  for (const file of ["../components/PublicHome.tsx", "../app/entertainment/page.tsx", "../app/professional/page.tsx"]) {
    assert.doesNotMatch(read(file), /status=\{/);
  }
});
