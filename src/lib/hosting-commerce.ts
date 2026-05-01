import type {
  HostingAddonOption,
  HostingConfigurationSelection,
  HostingControlPanelOption,
  HostingLocationOption,
  HostingOperatingSystemOption,
  HostingProviderSettings,
  ResolvedHostingConfiguration
} from "@/lib/hosting-types";

function getEnabledOperatingSystems(settings: HostingProviderSettings) {
  return settings.operatingSystems.filter((operatingSystem) => operatingSystem.enabled);
}

function getEnabledControlPanels(settings: HostingProviderSettings) {
  return settings.controlPanels.filter((panel) => panel.enabled);
}

function getEnabledAddons(settings: HostingProviderSettings) {
  return settings.addons.filter((addon) => addon.enabled);
}

function getEnabledLocations(settings: HostingProviderSettings) {
  return settings.locations.filter((location) => location.enabled);
}

function getDefaultControlPanel(settings: HostingProviderSettings) {
  const enabledPanels = getEnabledControlPanels(settings);
  return enabledPanels.find((panel) => panel.recommended) ?? enabledPanels[0] ?? null;
}

function getDefaultOperatingSystem(settings: HostingProviderSettings) {
  const enabledOperatingSystems = getEnabledOperatingSystems(settings);
  return enabledOperatingSystems.find((operatingSystem) => operatingSystem.recommended) ?? enabledOperatingSystems[0] ?? null;
}

function getDefaultLocation(settings: HostingProviderSettings) {
  const enabledLocations = getEnabledLocations(settings);
  return enabledLocations.find((location) => location.recommended) ?? enabledLocations[0] ?? null;
}

export function createDefaultHostingSelection(settings: HostingProviderSettings): HostingConfigurationSelection {
  const defaultOperatingSystem = getDefaultOperatingSystem(settings);
  const defaultPanel = getDefaultControlPanel(settings);
  const defaultLocation = getDefaultLocation(settings);

  return {
    type: "hosting_vps",
    operatingSystemId: defaultOperatingSystem?.id ?? "default-os",
    controlPanelId: defaultPanel?.id ?? "none",
    addonIds: getEnabledAddons(settings)
      .filter((addon) => addon.defaultSelected)
      .map((addon) => addon.id),
    locationId: defaultLocation?.id ?? "default",
    domainMode: "none",
    domainName: "",
    domainYears: 1,
    domainPrivacyProtection: true,
    domainUnitPrice: 0
  };
}

export function resolveHostingConfiguration(
  selection: HostingConfigurationSelection | undefined,
  settings: HostingProviderSettings
): ResolvedHostingConfiguration {
  const normalizedSelection = selection ?? createDefaultHostingSelection(settings);
  const enabledOperatingSystems = getEnabledOperatingSystems(settings);
  const enabledPanels = getEnabledControlPanels(settings);
  const enabledAddons = getEnabledAddons(settings);
  const enabledLocations = getEnabledLocations(settings);

  const fallbackOperatingSystem = getDefaultOperatingSystem(settings);
  const fallbackPanel = getDefaultControlPanel(settings);
  const fallbackLocation = getDefaultLocation(settings);

  const operatingSystem = enabledOperatingSystems.find((option) => option.id === normalizedSelection.operatingSystemId) ?? fallbackOperatingSystem;
  const controlPanel = enabledPanels.find((panel) => panel.id === normalizedSelection.controlPanelId) ?? fallbackPanel;
  const location = enabledLocations.find((option) => option.id === normalizedSelection.locationId) ?? fallbackLocation;

  const addonMap = new Map(enabledAddons.map((addon) => [addon.id, addon] as const));
  const addons = normalizedSelection.addonIds
    .map((addonId) => addonMap.get(addonId))
    .filter((addon): addon is HostingAddonOption => Boolean(addon));

  const extraMonthlyPrice = Number(
    ((controlPanel?.monthlyPrice ?? 0) + addons.reduce((total, addon) => total + addon.monthlyPrice, 0)).toFixed(2)
  );

  const domainMode = normalizedSelection.domainMode === "register" ? "register" : "none";
  const domainName = domainMode === "register" ? normalizedSelection.domainName.trim().toLowerCase() : "";
  const domainYears = domainMode === "register" ? Math.max(1, Math.floor(normalizedSelection.domainYears || 1)) : 1;
  const domainUnitPrice = domainMode === "register" ? Math.max(0, Number(normalizedSelection.domainUnitPrice) || 0) : 0;
  const domainRegistrationPrice = Number((domainUnitPrice * domainYears).toFixed(2));
  const totalPriceAdjustment = Number((extraMonthlyPrice + domainRegistrationPrice).toFixed(2));

  const summaryLines = [
    operatingSystem ? `OS: ${operatingSystem.name}` : "OS: Default",
    controlPanel ? `Panel: ${controlPanel.name}` : "Panel: None",
    location ? `Region: ${location.name}` : "Region: Default",
    ...addons.map((addon) => addon.name),
    ...(domainMode === "register" && domainName ? [`Domain: ${domainName}`] : [])
  ];

  return {
    selection: {
      type: "hosting_vps",
      operatingSystemId: operatingSystem?.id ?? normalizedSelection.operatingSystemId,
      controlPanelId: controlPanel?.id ?? normalizedSelection.controlPanelId,
      addonIds: addons.map((addon) => addon.id),
      locationId: location?.id ?? normalizedSelection.locationId,
      domainMode,
      domainName,
      domainYears,
      domainPrivacyProtection: domainMode === "register" ? normalizedSelection.domainPrivacyProtection !== false : true,
      domainUnitPrice
    },
    operatingSystem,
    controlPanel,
    addons,
    location,
    extraMonthlyPrice,
    domainRegistrationPrice,
    totalPriceAdjustment,
    domain: {
      mode: domainMode,
      name: domainName || null,
      years: domainYears,
      privacyProtection: domainMode === "register" ? normalizedSelection.domainPrivacyProtection !== false : true,
      unitPrice: domainUnitPrice,
      totalPrice: domainRegistrationPrice
    },
    summaryLines
  };
}

export function getHostingConfigurationTotal(basePrice: number, configuration: ResolvedHostingConfiguration) {
  return Number((basePrice + configuration.totalPriceAdjustment).toFixed(2));
}

export function findHostingControlPanelById(id: string, settings: HostingProviderSettings) {
  return settings.controlPanels.find((panel) => panel.id === id) ?? null;
}

export function findHostingLocationById(id: string, settings: HostingProviderSettings) {
  return settings.locations.find((location) => location.id === id) ?? null;
}

export function findHostingOperatingSystemById(id: string, settings: HostingProviderSettings) {
  return settings.operatingSystems.find((operatingSystem) => operatingSystem.id === id) ?? null;
}

export type { HostingConfigurationSelection, HostingControlPanelOption, HostingLocationOption, HostingOperatingSystemOption };
