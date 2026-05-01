import type {
  HostingAddonOption,
  HostingConfigurationSelection,
  HostingControlPanelOption,
  HostingLocationOption,
  HostingProviderSettings,
  ResolvedHostingConfiguration
} from "@/lib/hosting-types";

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

function getDefaultLocation(settings: HostingProviderSettings) {
  const enabledLocations = getEnabledLocations(settings);
  return enabledLocations.find((location) => location.recommended) ?? enabledLocations[0] ?? null;
}

export function createDefaultHostingSelection(settings: HostingProviderSettings): HostingConfigurationSelection {
  const defaultPanel = getDefaultControlPanel(settings);
  const defaultLocation = getDefaultLocation(settings);

  return {
    type: "hosting_vps",
    controlPanelId: defaultPanel?.id ?? "none",
    addonIds: getEnabledAddons(settings)
      .filter((addon) => addon.defaultSelected)
      .map((addon) => addon.id),
    locationId: defaultLocation?.id ?? "default"
  };
}

export function resolveHostingConfiguration(
  selection: HostingConfigurationSelection | undefined,
  settings: HostingProviderSettings
): ResolvedHostingConfiguration {
  const normalizedSelection = selection ?? createDefaultHostingSelection(settings);
  const enabledPanels = getEnabledControlPanels(settings);
  const enabledAddons = getEnabledAddons(settings);
  const enabledLocations = getEnabledLocations(settings);

  const fallbackPanel = getDefaultControlPanel(settings);
  const fallbackLocation = getDefaultLocation(settings);

  const controlPanel = enabledPanels.find((panel) => panel.id === normalizedSelection.controlPanelId) ?? fallbackPanel;
  const location = enabledLocations.find((option) => option.id === normalizedSelection.locationId) ?? fallbackLocation;

  const addonMap = new Map(enabledAddons.map((addon) => [addon.id, addon] as const));
  const addons = normalizedSelection.addonIds
    .map((addonId) => addonMap.get(addonId))
    .filter((addon): addon is HostingAddonOption => Boolean(addon));

  const extraMonthlyPrice = Number(
    ((controlPanel?.monthlyPrice ?? 0) + addons.reduce((total, addon) => total + addon.monthlyPrice, 0)).toFixed(2)
  );

  const summaryLines = [
    controlPanel ? `Panel: ${controlPanel.name}` : "Panel: None",
    location ? `Region: ${location.name}` : "Region: Default",
    ...addons.map((addon) => addon.name)
  ];

  return {
    selection: {
      type: "hosting_vps",
      controlPanelId: controlPanel?.id ?? normalizedSelection.controlPanelId,
      addonIds: addons.map((addon) => addon.id),
      locationId: location?.id ?? normalizedSelection.locationId
    },
    controlPanel,
    addons,
    location,
    extraMonthlyPrice,
    summaryLines
  };
}

export function getHostingConfigurationTotal(basePrice: number, configuration: ResolvedHostingConfiguration) {
  return Number((basePrice + configuration.extraMonthlyPrice).toFixed(2));
}

export function findHostingControlPanelById(id: string, settings: HostingProviderSettings) {
  return settings.controlPanels.find((panel) => panel.id === id) ?? null;
}

export function findHostingLocationById(id: string, settings: HostingProviderSettings) {
  return settings.locations.find((location) => location.id === id) ?? null;
}

export type { HostingConfigurationSelection, HostingControlPanelOption, HostingLocationOption };
