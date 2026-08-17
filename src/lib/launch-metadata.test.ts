import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const metadataLengthRange = { min: 140, max: 160 };

function assertMetadataLength(label: string, value: string) {
  assert.ok(
    value.length >= metadataLengthRange.min && value.length <= metadataLengthRange.max,
    `${label} metadata description must be ${metadataLengthRange.min}-${metadataLengthRange.max} characters; received ${value.length}`,
  );
}

test("Singularis exposes launch-ready description and share-image metadata", async () => {
  const products = await readFile(
    path.join(process.cwd(), "src/lib/products.ts"),
    "utf8",
  );
  const singularisBlock = products.match(
    /slug: "singularis",([\s\S]*?)publication_status: "scheduled"/,
  )?.[1];
  assert.ok(singularisBlock);
  const description = singularisBlock.match(/summary:\s*\n\s*"([^"]+)"/)?.[1];
  assert.ok(description);
  assertMetadataLength("Singularis", description);
  assert.match(singularisBlock, /shareImage: "\/share\/singularis\.png"/);

  const source = await readFile(
    path.join(process.cwd(), "src/app/products/[slug]/page.tsx"),
    "utf8",
  );
  assert.match(source, /product\.shareImage/);
  assert.match(source, /summary_large_image/);
});

test("Cryptic Signal audio route exposes launch-ready description and share image", async () => {
  const source = await readFile(
    path.join(process.cwd(), "src/app/audio/page.tsx"),
    "utf8",
  );
  const description = source.match(/description:\s*\n\s*"([^"]+)"/)?.[1];
  assert.ok(description);
  assertMetadataLength("Cryptic Signal", description);
  assert.match(source, /\/share\/audio\.png/);
  assert.match(source, /summary_large_image/);
});

test("route-specific share cards use the 1200 by 630 social format", async () => {
  for (const file of ["singularis.png", "audio.png"]) {
    const png = await readFile(path.join(process.cwd(), "public/share", file));
    assert.equal(png.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(png.readUInt32BE(16), 1200, `${file} width`);
    assert.equal(png.readUInt32BE(20), 630, `${file} height`);
  }
});
