export type CampaignStatus = "draft" | "active" | "closed";

export interface Campaign {
  id: string;
  title: string;
  goalCents: number;
  raisedCents: number;
  status: CampaignStatus;
  createdAt: string;
}

export interface Pledge {
  id: string;
  campaignId: string;
  amountCents: number;
  pledgedAt: string;
  externalPaymentPerformed: false;
}

const ID_RE = /^[a-zA-Z0-9._-]{1,96}$/;
const MAX_CAMPAIGNS = 2_000;
const MAX_PLEDGES = 100_000;
const MAX_AMOUNT_CENTS = 1_000_000_000_00;

export class SkyFundraising {
  readonly #campaigns = new Map<string, Campaign>();
  readonly #pledges = new Map<string, Pledge>();

  createCampaign(input: Omit<Campaign, "raisedCents" | "status">): Campaign {
    if (!ID_RE.test(input.id)) throw new Error("invalid campaign id");
    const title = input.title.trim();
    if (title.length < 3 || title.length > 160) throw new Error("invalid campaign title");
    if (!Number.isSafeInteger(input.goalCents) || input.goalCents <= 0 || input.goalCents > MAX_AMOUNT_CENTS) {
      throw new Error("invalid campaign goal");
    }
    if (this.#campaigns.has(input.id)) throw new Error("duplicate campaign id");
    if (this.#campaigns.size >= MAX_CAMPAIGNS) throw new Error("campaign capacity exceeded");
    const createdAt = parseTimestamp(input.createdAt);
    const campaign = Object.freeze({
      id: input.id,
      title,
      goalCents: input.goalCents,
      raisedCents: 0,
      status: "draft" as const,
      createdAt
    });
    this.#campaigns.set(campaign.id, campaign);
    return campaign;
  }

  activate(campaignId: string): Campaign {
    const current = this.requireCampaign(campaignId);
    if (current.status !== "draft") throw new Error("campaign is not draft");
    return this.store({ ...current, status: "active" });
  }

  close(campaignId: string): Campaign {
    const current = this.requireCampaign(campaignId);
    if (current.status === "closed") return current;
    return this.store({ ...current, status: "closed" });
  }

  recordPledge(campaignId: string, pledgeId: string, amountCents: number, pledgedAt: string): Pledge {
    if (!ID_RE.test(pledgeId)) throw new Error("invalid pledge id");
    if (this.#pledges.has(pledgeId)) throw new Error("duplicate pledge id");
    if (this.#pledges.size >= MAX_PLEDGES) throw new Error("pledge capacity exceeded");
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS) {
      throw new Error("invalid pledge amount");
    }
    const campaign = this.requireCampaign(campaignId);
    if (campaign.status !== "active") throw new Error("campaign is not active");
    if (campaign.raisedCents > Number.MAX_SAFE_INTEGER - amountCents) throw new Error("raised amount overflow");

    const pledge = Object.freeze({
      id: pledgeId,
      campaignId,
      amountCents,
      pledgedAt: parseTimestamp(pledgedAt),
      externalPaymentPerformed: false as const
    });
    this.#pledges.set(pledgeId, pledge);
    this.store({ ...campaign, raisedCents: campaign.raisedCents + amountCents });
    return pledge;
  }

  getCampaign(campaignId: string): Campaign {
    return this.requireCampaign(campaignId);
  }

  listCampaigns(): Campaign[] {
    return [...this.#campaigns.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  progressBasisPoints(campaignId: string): number {
    const campaign = this.requireCampaign(campaignId);
    return Math.min(10_000, Math.floor((campaign.raisedCents * 10_000) / campaign.goalCents));
  }

  private store(campaign: Campaign): Campaign {
    const frozen = Object.freeze({ ...campaign });
    this.#campaigns.set(campaign.id, frozen);
    return frozen;
  }

  private requireCampaign(campaignId: string): Campaign {
    if (!ID_RE.test(campaignId)) throw new Error("invalid campaign id");
    const campaign = this.#campaigns.get(campaignId);
    if (!campaign) throw new Error("campaign not found");
    return campaign;
  }
}

function parseTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error("invalid timestamp");
  return parsed.toISOString();
}
