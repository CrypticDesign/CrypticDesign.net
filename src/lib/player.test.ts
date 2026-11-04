import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultQueue,
  initialPlaybackStatus,
  playbackIsBlocked,
  playerTrackIndexById,
  playerTrackSharePath,
  playerStatusPresentation,
  type PlayerTrack,
} from "./player.ts";

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
  assert.ok(queue.every((track) => track.availability === "public"));
  assert.ok(queue.every((track) => track.support.captions === "not-applicable"));
});

test("builds stable public share paths without exposing media source URLs", () => {
  const queue = defaultQueue();

  assert.equal(playerTrackSharePath(queue[0]), "/audio?track=reflection");
  assert.equal(playerTrackSharePath({ id: "signal / one" }), "/audio?track=signal%20%2F%20one");
  assert.doesNotMatch(playerTrackSharePath(queue[0]), /\.mp3|\/audio\/cda001/i);
});

test("resolves shared track ids only when they exist in the playable queue", () => {
  const queue = defaultQueue();

  assert.equal(playerTrackIndexById(queue, "baseline"), 1);
  assert.equal(playerTrackIndexById(queue, "leviathan-dreaming"), 3);
  assert.equal(playerTrackIndexById(queue, "not-published"), null);
  assert.equal(playerTrackIndexById(queue, null), null);
});

const track: PlayerTrack = {
  id: "test",
  title: "Test",
  artist: "Cryptic Signal",
  artwork: "/test.png",
  duration: 60,
  src: "/audio/test.mp3",
  availability: "public",
  support: { chapters: "not-offered", captions: "not-applicable", transcript: "not-offered" },
  format: "MP3",
  bitrate: "256 Kbps",
};

test("resolves source availability before attempting playback", () => {
  assert.equal(initialPlaybackStatus(track), "idle");
  assert.equal(initialPlaybackStatus(track, false), "offline");
  assert.equal(initialPlaybackStatus({ ...track, src: undefined }), "unavailable");
  assert.equal(
    initialPlaybackStatus({ ...track, src: undefined, availability: "restricted" }),
    "restricted",
  );
});

test("publishes final copy and retry policy for every operational state", () => {
  for (const status of [
    "idle",
    "loading",
    "ready",
    "playing",
    "paused",
    "buffering",
    "offline",
    "unavailable",
    "restricted",
    "interrupted",
    "error",
  ] as const) {
    const presentation = playerStatusPresentation(status);
    assert.ok(presentation.label.length > 0, status);
    assert.ok(presentation.message.length > 0, status);
  }

  assert.equal(playerStatusPresentation("error").retryable, true);
  assert.equal(playerStatusPresentation("offline").retryable, true);
  assert.equal(playerStatusPresentation("restricted").retryable, false);
  assert.equal(playbackIsBlocked("restricted"), true);
  assert.equal(playbackIsBlocked("interrupted"), true);
  assert.equal(playbackIsBlocked("error"), false);
});
