export type SupportCategory = "housing" | "food" | "health" | "education" | "employment" | "transport" | "legal" | "other";

export interface SupportResource {
  id: string;
  name: string;
  categories: readonly SupportCategory[];
  tags: readonly string[];
  active: boolean;
}

export interface ReferralRequest {
  id: string;
  resourceId: string;
  requestedAt: string;
  status: "requested";
  externalSubmissionPerformed: false;
}

const ID_RE = /^[a-zA-Z0-9._-]{1,96}$/;
const TAG_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
const MAX_RESOURCES = 2_000;
const MAX_TAGS = 16;

export class SkyHopeDirectory {
  readonly #resources = new Map<string, SupportResource>();

  register(resource: SupportResource): SupportResource {
    if (!ID_RE.test(resource.id)) throw new Error("invalid resource id");
    const name = resource.name.trim();
    if (name.length < 2 || name.length > 120) throw new Error("invalid resource name");
    if (resource.categories.length === 0 || resource.categories.length > 8) throw new Error("invalid categories");
    if (resource.tags.length > MAX_TAGS || resource.tags.some((tag) => !TAG_RE.test(tag))) throw new Error("invalid tags");
    if (!this.#resources.has(resource.id) && this.#resources.size >= MAX_RESOURCES) throw new Error("capacity exceeded");

    const normalized: SupportResource = Object.freeze({
      id: resource.id,
      name,
      categories: Object.freeze([...new Set(resource.categories)]),
      tags: Object.freeze([...new Set(resource.tags)].sort()),
      active: resource.active
    });
    this.#resources.set(resource.id, normalized);
    return normalized;
  }

  list(): SupportResource[] {
    return [...this.#resources.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  find(category: SupportCategory, tags: readonly string[] = []): SupportResource[] {
    if (tags.length > MAX_TAGS || tags.some((tag) => !TAG_RE.test(tag))) throw new Error("invalid tags");
    const wanted = new Set(tags);
    return this.list().filter((resource) =>
      resource.active && resource.categories.includes(category) && [...wanted].every((tag) => resource.tags.includes(tag))
    );
  }

  requestReferral(resourceId: string, requestId: string, requestedAt: string): ReferralRequest {
    if (!ID_RE.test(requestId)) throw new Error("invalid request id");
    const resource = this.#resources.get(resourceId);
    if (!resource || !resource.active) throw new Error("resource unavailable");
    const parsed = new Date(requestedAt);
    if (Number.isNaN(parsed.valueOf())) throw new Error("invalid timestamp");

    return Object.freeze({
      id: requestId,
      resourceId,
      requestedAt: parsed.toISOString(),
      status: "requested",
      externalSubmissionPerformed: false
    });
  }
}
