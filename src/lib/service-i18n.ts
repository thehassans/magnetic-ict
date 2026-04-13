type Translator = (key: string) => string;

export function getServiceTitle(t: Translator, serviceId: string) {
  return t(`items.${serviceId}.title`);
}

export function getServiceDescription(t: Translator, serviceId: string) {
  return t(`items.${serviceId}.description`);
}

export function getTierNameKey(tierId: string) {
  if (tierId.endsWith("-starter")) {
    return "tierStarter";
  }

  if (tierId.endsWith("-professional")) {
    return "tierProfessional";
  }

  if (tierId.endsWith("-enterprise")) {
    return "tierEnterprise";
  }

  return null;
}

export function getLocalizedTierName(t: Translator, tierId: string, fallback: string) {
  const key = getTierNameKey(tierId);
  return key ? t(key) : fallback;
}
