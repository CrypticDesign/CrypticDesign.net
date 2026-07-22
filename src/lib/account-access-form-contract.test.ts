import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentUrl = new URL("../components/AccountAccessForm.tsx", import.meta.url);

test("account inputs retain a visible, minimum-size control treatment", async () => {
  const source = await readFile(componentUrl, "utf8");
  assert.match(source, /min-h-11/);
  assert.match(source, /border-\[var\(--line\)\]/);
  assert.match(source, /bg-\[var\(--canvas\)\]/);
  assert.equal((source.match(/className=\{inputClassName\}/g) ?? []).length, 3);
});
