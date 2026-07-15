import assert from "node:assert/strict";
import test from "node:test";
import { canManageCharacter, publicCharacter, validateCharacterInput, type CharacterIdentity } from "./characters.ts";
import { DEFAULT_AVATAR_RECIPE } from "./avatar.ts";

const character: CharacterIdentity = { id: "char_1", ownerAccountId: "member_1", kind: "member", name: "Nova", handle: "nova", archetype: "Navigator", bio: "A careful explorer.", portraitUrl: null, affiliation: null, presence: "offline", discoverable: false, visibility: "private", publicationConsent: false, stewardOperatorId: null, provenance: "account-created", status: "active", createdAt: "2026-07-13T00:00:00Z", updatedAt: "2026-07-13T00:00:00Z" };
test("separates account authorization from public character identity", () => {
  assert.equal(canManageCharacter("member_1", character), true);
  assert.equal(canManageCharacter("member_2", character), false);
  assert.equal(publicCharacter(character), null);
  const publiclyRenderable = publicCharacter({ ...character, visibility: "public", discoverable: true, publicationConsent: true });
  assert.equal("ownerAccountId" in publiclyRenderable!, false);
});
test("system citizens cannot grant account authority", () => assert.equal(canManageCharacter("member_1", { ...character, kind: "system", ownerAccountId: null }), false));
test("validates privacy-safe public profile limits", () => {
  assert.deepEqual(validateCharacterInput({ name: " Nova ", archetype: "Navigator", bio: " Hi " }), { name: "Nova", handle: "nova", archetype: "Navigator", bio: "Hi", portraitUrl: null, avatarRecipe: DEFAULT_AVATAR_RECIPE, affiliation: null, presence: "offline", discoverable: false, visibility: "private", publicationConsent: false });
  assert.throws(() => validateCharacterInput({ name: "", archetype: "Navigator" }), /between 1 and 32/);
  assert.throws(() => validateCharacterInput({ name: "Nova", archetype: "Administrator" }), /Unknown/);
});
