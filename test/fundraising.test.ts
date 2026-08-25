import test from "node:test";
import assert from "node:assert/strict";
import { SkyFundraising } from "../src/fundraising.js";

test("campaign lifecycle and pledge progress are deterministic", () => {
  const fundraising = new SkyFundraising();
  const campaign = fundraising.createCampaign({
    id: "campaign-1",
    title: "Community technology fund",
    goalCents: 100_00,
    createdAt: "2026-08-25T00:00:00Z"
  });
  assert.equal(campaign.status, "draft");
  fundraising.activate(campaign.id);
  const pledge = fundraising.recordPledge(campaign.id, "pledge-1", 25_00, "2026-08-25T01:00:00Z");
  assert.equal(pledge.externalPaymentPerformed, false);
  assert.equal(fundraising.getCampaign(campaign.id).raisedCents, 25_00);
  assert.equal(fundraising.progressBasisPoints(campaign.id), 2500);
  assert.equal(fundraising.close(campaign.id).status, "closed");
});

test("fundraising fails closed on invalid states and duplicate pledge ids", () => {
  const fundraising = new SkyFundraising();
  fundraising.createCampaign({ id: "c", title: "Valid campaign", goalCents: 5000, createdAt: "2026-08-25T00:00:00Z" });
  assert.throws(() => fundraising.recordPledge("c", "p1", 100, "2026-08-25T00:00:00Z"), /not active/);
  fundraising.activate("c");
  fundraising.recordPledge("c", "p1", 100, "2026-08-25T00:00:00Z");
  assert.throws(() => fundraising.recordPledge("c", "p1", 100, "2026-08-25T00:00:00Z"), /duplicate/);
  assert.throws(() => fundraising.createCampaign({ id: "bad id", title: "Nope", goalCents: 1, createdAt: "2026-08-25T00:00:00Z" }), /invalid campaign id/);
});
