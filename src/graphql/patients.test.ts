// node --experimental-strip-types --test src/graphql/patients.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { addPatient, changePatient, listPatients, removePatient } from "./patients.ts";

const valid = { name: " Ann ", phone: "555-0000", provider: "Dr. X", nextVisit: "2026-01-02" };

test("add trims, defaults status and balance, and appends", () => {
  const before = listPatients().length;
  const added = addPatient({ ...valid });
  assert.equal(added.name, "Ann");
  assert.equal(added.status, "SCHEDULED");
  assert.equal(added.balance, 0);
  assert.equal(listPatients().length, before + 1);
  removePatient(added.id);
});

test("blank strings, bad dates and negative balances are rejected", () => {
  for (const bad of [
    { ...valid, name: "   " },
    { ...valid, nextVisit: "02/01/2026" },
    { ...valid, nextVisit: "2026-02-31" },
    { ...valid, balance: -1 },
  ]) {
    assert.throws(() => addPatient(bad), /blank|YYYY-MM-DD|not a real date|positive amount/);
  }
});

test("change touches only the fields sent, and an empty change is an error", () => {
  const added = addPatient({ ...valid, balance: 40 });
  const changed = changePatient(added.id, { status: "NO_SHOW" });
  assert.equal(changed.status, "NO_SHOW");
  assert.equal(changed.balance, 40, "balance must survive a status-only change");
  assert.equal(changed.name, "Ann");
  assert.throws(() => changePatient(added.id, {}), /at least one field/);
  removePatient(added.id);
});

test("unknown ids are named in the error, not silently ignored", () => {
  assert.throws(() => changePatient("nope", { status: "COMPLETED" }), /No patient has id nope/);
  assert.throws(() => removePatient("nope"), /No patient has id nope/);
});

test("remove drops exactly one row and returns its id", () => {
  const added = addPatient({ ...valid });
  const before = listPatients().length;
  assert.equal(removePatient(added.id), added.id);
  assert.equal(listPatients().length, before - 1);
});
