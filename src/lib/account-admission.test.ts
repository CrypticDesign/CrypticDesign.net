import assert from "node:assert/strict";
import test from "node:test";

import {
  ACCOUNT_ADMISSION_CLOSED_MESSAGE,
  PUBLIC_ACCOUNT_CREATION_AVAILABLE,
  accountAdmissionMode,
} from "./account-admission.ts";

test("account admission fails closed when configuration is absent or invalid", () => {
  const original = process.env.ACCOUNT_ADMISSION_MODE;
  try {
    delete process.env.ACCOUNT_ADMISSION_MODE;
    assert.equal(accountAdmissionMode(), "closed");

    process.env.ACCOUNT_ADMISSION_MODE = "open";
    assert.equal(accountAdmissionMode(), "closed");
  } finally {
    if (original === undefined) delete process.env.ACCOUNT_ADMISSION_MODE;
    else process.env.ACCOUNT_ADMISSION_MODE = original;
  }
});

test("invitation mode never enables public account creation", () => {
  const original = process.env.ACCOUNT_ADMISSION_MODE;
  try {
    process.env.ACCOUNT_ADMISSION_MODE = "invitation";
    assert.equal(accountAdmissionMode(), "invitation");
    assert.equal(PUBLIC_ACCOUNT_CREATION_AVAILABLE, false);
  } finally {
    if (original === undefined) delete process.env.ACCOUNT_ADMISSION_MODE;
    else process.env.ACCOUNT_ADMISSION_MODE = original;
  }
});

test("closed messaging preserves accountless public access", () => {
  assert.equal(PUBLIC_ACCOUNT_CREATION_AVAILABLE, false);
  assert.match(ACCOUNT_ADMISSION_CLOSED_MESSAGE, /Public pages and samples remain available without an account/);
});
