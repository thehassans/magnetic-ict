export type DomainCartItem = {
  domain: string;
  years: number;
  price: number;
  privacyProtection: boolean;
  addedAt: string;
};

export const DOMAIN_CART_STORAGE_KEY = "magneticict-domain-cart-v2";
export const DOMAIN_CART_LEGACY_STORAGE_KEYS = ["magneticict-domain-cart"] as const;

function normalizeDomain(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeYears(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 1;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

function normalizePrice(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Number(value.toFixed(2));
}

function normalizeAddedAt(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isCartRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizeDomainCartItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as DomainCartItem[];
  }

  const seen = new Set<string>();

  return value.flatMap((entry) => {
    if (!isCartRecord(entry)) {
      return [];
    }

    const domain = normalizeDomain(entry.domain);
    const addedAt = normalizeAddedAt(entry.addedAt);

    if (!domain || !addedAt || seen.has(domain)) {
      return [];
    }

    seen.add(domain);

    return [{
      domain,
      years: normalizeYears(entry.years),
      price: normalizePrice(entry.price),
      privacyProtection: entry.privacyProtection !== false,
      addedAt
    } satisfies DomainCartItem];
  });
}

export function readDomainCart(storage: Pick<Storage, "getItem" | "removeItem">) {
  for (const key of DOMAIN_CART_LEGACY_STORAGE_KEYS) {
    storage.removeItem(key);
  }

  try {
    return sanitizeDomainCartItems(JSON.parse(storage.getItem(DOMAIN_CART_STORAGE_KEY) ?? "[]"));
  } catch {
    return [] as DomainCartItem[];
  }
}

export function writeDomainCart(storage: Pick<Storage, "setItem">, items: DomainCartItem[]) {
  storage.setItem(DOMAIN_CART_STORAGE_KEY, JSON.stringify(items));
}
