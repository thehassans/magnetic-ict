function stripWrappingQuotes(value: string) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];

    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }

  return value;
}

function getNormalizedEnvValue(rawValue?: string | null) {
  if (typeof rawValue !== "string") {
    return null;
  }

  const trimmed = rawValue.trim();
  const unquoted = stripWrappingQuotes(trimmed).trim();
  return unquoted || null;
}

export function getConfiguredAdminEmail() {
  return getNormalizedEnvValue(process.env.ADMIN_EMAIL)?.toLowerCase() ?? null;
}

export function getConfiguredAdminPasswordCandidates() {
  const rawValue = process.env.ADMIN_PASSWORD;

  if (typeof rawValue !== "string") {
    return [] as string[];
  }

  const variants = [
    rawValue,
    rawValue.trim(),
    stripWrappingQuotes(rawValue),
    stripWrappingQuotes(rawValue.trim()).trim()
  ].filter((value) => value.length > 0);

  return [...new Set(variants)];
}

export function hasConfiguredAdminCredentials() {
  return Boolean(getConfiguredAdminEmail() && getConfiguredAdminPasswordCandidates().length > 0);
}
