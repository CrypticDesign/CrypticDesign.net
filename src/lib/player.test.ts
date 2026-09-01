import assert from "node:assert/strict";
import test from "node:test";

import { defaultQueue } from "./player.ts";

test("the default player library contains only playable tracks", () => {
  const queue = defaultQueue();

  assert.deepEqual(
    queue.map((track) => track.title),
    [
      "Reflection",
      "Baseline",
      "Kyrie of a Dying Star Cabaret",
      "Leviathan Dreaming",
    ],
  );
  assert.ok(queue.every((track) => track.src), "every library track must have an audio source");
});
