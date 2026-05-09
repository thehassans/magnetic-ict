import type { DomainSearchResult } from "@/lib/domain-types";
import { applyDomainMarkup, checkIonosDomainAvailability, isIonosDomainApiAvailable } from "@/lib/ionos-domain";
import { getDomainProviderSettings } from "@/lib/platform-settings";

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function isValidDomainLabel(value: string) {
  return /^[a-z0-9-]{1,63}$/i.test(value) && !value.startsWith("-") && !value.endsWith("-");
}

function extractTld(domain: string) {
  const parts = domain.split(".").filter(Boolean);
  return parts.length >= 2 ? parts.at(-1) ?? "" : "";
}

function resolvePrice(domain: string, settings: Awaited<ReturnType<typeof getDomainProviderSettings>>) {
  const tld = extractTld(domain);
  const found = settings.tlds.find((t) => t.tld === tld);
  if (found && found.status === "Active") {
    return found.registerPrice;
  }
  return 19.99; // fallback
}

async function checkDomain(domain: string): Promise<DomainSearchResult["status"]> {
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { Accept: "application/rdap+json, application/json" },
      cache: "no-store"
    });

    if (response.status === 404) {
      return "available";
    }

    if (response.ok) {
      return "taken";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function searchDomains(query: string) {
  const normalized = normalizeQuery(query);
  const settings = await getDomainProviderSettings();
  const ionosAvailable = settings.mode === "live" && await isIonosDomainApiAvailable();

  if (!normalized) {
    return [] as DomainSearchResult[];
  }

  const popularTlds = settings.tlds.filter(t => t.isPopular && t.status === "Active").map(t => t.tld);
  const suggestedTlds = popularTlds.length > 0 ? popularTlds : ["com", "net", "org", "io"];

  const candidates = normalized.includes(".")
    ? [normalized]
    : suggestedTlds.map((tld) => `${normalized}.${tld}`);

  const uniqueCandidates = [...new Set(candidates)].filter((candidate) => {
    const [label] = candidate.split(".");
    return Boolean(label) && isValidDomainLabel(label);
  });

  if (ionosAvailable) {
    return Promise.all(uniqueCandidates.map((candidate) => checkIonosDomainAvailability(candidate)));
  }

  const statuses = await Promise.all(uniqueCandidates.map((candidate) => checkDomain(candidate)));

  return uniqueCandidates.map((domain, index) => {
    const status = statuses[index];
    const basePrice = resolvePrice(domain, settings);
    const { markupAmount, price } = applyDomainMarkup(basePrice, settings.priceMarkupPercent, settings.priceMarkupFlat);
    return {
      domain,
      status,
      available: status === "unknown" ? null : status === "available",
      basePrice,
      markupAmount,
      price,
      currency: "USD",
      source: "rdap"
    } satisfies DomainSearchResult;
  });
}
