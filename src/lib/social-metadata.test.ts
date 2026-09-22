import assert from "node:assert/strict";
import test from "node:test";

import { socialMetadata } from "./social-metadata.ts";

test("builds complete route-owned Open Graph and X metadata", () => {
  const metadata = socialMetadata({
    title: "Example | Cryptic Design",
    description: "A complete metadata definition for a public route.",
    url: "/example",
    image: "/share/example.png",
  });

  assert.deepEqual(metadata.openGraph, {
    title: "Example | Cryptic Design",
    description: "A complete metadata definition for a public route.",
    url: "/example",
    siteName: "Cryptic Design",
    type: "website",
    images: ["/share/example.png"],
  });
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "Example | Cryptic Design",
    description: "A complete metadata definition for a public route.",
    images: ["/share/example.png"],
  });
});

test("preserves article publication metadata", () => {
  const metadata = socialMetadata({
    title: "Article",
    description: "Article description",
    url: "/professional/articles/article",
    image: "/images/articles/article.png",
    type: "article",
    publishedTime: "2026-09-22",
  });

  const openGraph = metadata.openGraph;
  assert.ok(openGraph && "type" in openGraph);
  assert.equal(openGraph.type, "article");
  if (openGraph.type === "article") assert.equal(openGraph.publishedTime, "2026-09-22");
});
