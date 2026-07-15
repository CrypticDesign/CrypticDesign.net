import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";

async function json(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json();
  return { response, body };
}

const anonymous = await json("/api/characters");
assert.equal(anonymous.response.status, 401);
assert.equal(anonymous.body.error, "Authentication required");

const signIn = await fetch(`${baseUrl}/api/membership/session`, { method: "POST" });
assert.equal(signIn.status, 200);
const cookie = signIn.headers.get("set-cookie")?.split(";", 1)[0];
assert.ok(cookie, "Preview sign-in must set a session cookie");

const suffix = `${Date.now()}-${crypto.randomUUID()}`;
const handle = `e2e-${suffix}`.slice(0, 32).replace(/-$/, "0");
const headers = {
  cookie,
  "content-type": "application/json",
  "idempotency-key": `e2e-character-create-${suffix}`,
};
const create = await json("/api/characters", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "E2E Character",
    handle,
    archetype: "Builder",
    bio: "Local authenticated character lifecycle verification",
    avatarRecipe: {
      schemaVersion: 1,
      rigId: "cryptic-humanoid-v1",
      skinTone: "copper",
      outfit: "signal",
      accent: "cyan",
      trait: "none",
    },
    presence: "offline",
    discoverable: false,
    visibility: "private",
    publicationConsent: false,
  }),
});
assert.equal(create.response.status, 201);
assert.equal(create.body.character.handle, handle);
assert.equal(create.body.character.status, "active");
const characterId = create.body.character.id;

const replay = await json("/api/characters", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "E2E Character",
    handle,
    archetype: "Builder",
    bio: "Local authenticated character lifecycle verification",
  }),
});
assert.ok([200, 201, 409].includes(replay.response.status), "Create replay must be deterministic or fail closed");

const owned = await json("/api/characters", { headers: { cookie } });
assert.equal(owned.response.status, 200);
assert.equal(owned.body.character.id, characterId);

for (const path of ["history", "progression", "rpg", "rpg-content"]) {
  const result = await json(`/api/characters/${characterId}/${path}`, { headers: { cookie } });
  assert.equal(result.response.status, 200, `${path} must be readable by the owner`);
}

const retire = await json(`/api/characters/${characterId}`, {
  method: "PATCH",
  headers: {
    cookie,
    "content-type": "application/json",
    "idempotency-key": `e2e-character-retire-${suffix}`,
  },
  body: JSON.stringify({ status: "retired" }),
});
assert.equal(retire.response.status, 200);
assert.equal(retire.body.character.status, "retired");

const history = await json(`/api/characters/${characterId}/history`, { headers: { cookie } });
assert.equal(history.response.status, 200);
assert.ok(history.body.history.some((event) => event.type === "created"));
assert.ok(history.body.history.some((event) => event.type === "status_changed"));

const signOut = await fetch(`${baseUrl}/api/membership/session`, { method: "DELETE", headers: { cookie } });
assert.equal(signOut.status, 200);
const signedOut = await json("/api/characters", { headers: { cookie: signOut.headers.get("set-cookie")?.split(";", 1)[0] ?? "" } });
assert.equal(signedOut.response.status, 401);

console.log("Character E2E passed: deny anonymous -> sign-in -> create -> read domains -> retire -> history -> sign-out");
