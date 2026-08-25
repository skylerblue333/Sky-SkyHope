import assert from "node:assert/strict";
import test from "node:test";
import { SkyHopeDirectory } from "../src/index.js";

test("registers, filters, and creates truthful referral requests", () => {
  const directory = new SkyHopeDirectory();
  directory.register({
    id: "hope.food.1",
    name: "Community Food Support",
    categories: ["food"],
    tags: ["family", "local"],
    active: true
  });

  assert.equal(directory.find("food", ["family"]).length, 1);
  const referral = directory.requestReferral("hope.food.1", "req-1", "2026-08-25T00:00:00Z");
  assert.equal(referral.status, "requested");
  assert.equal(referral.externalSubmissionPerformed, false);
});

test("rejects inactive resources and malformed inputs", () => {
  const directory = new SkyHopeDirectory();
  assert.throws(() => directory.register({ id: "bad id", name: "Valid Name", categories: ["food"], tags: [], active: true }));

  directory.register({ id: "hope.closed", name: "Closed Resource", categories: ["housing"], tags: [], active: false });
  assert.equal(directory.find("housing").length, 0);
  assert.throws(() => directory.requestReferral("hope.closed", "req-2", "2026-08-25T00:00:00Z"));
});
