export type HostingProviderSettings = {
  enabled: boolean;
  mode: "manual" | "live";
  resellerBaseUrl: string;
  resellerUsername: string;
  resellerPassword: string;
  cloudBaseUrl: string;
  cloudToken: string;
  cloudContractNumber: string;
  defaultLocation: string;
  defaultImageAlias: string;
  createResellerContracts: boolean;
  createContractAdmins: boolean;
  controlPanels: HostingControlPanelOption[];
  addons: HostingAddonOption[];
  locations: HostingLocationOption[];
};

export type HostingControlPanelOption = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  enabled: boolean;
  recommended: boolean;
};

export type HostingAddonOption = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  enabled: boolean;
  defaultSelected: boolean;
};

export type HostingLocationOption = {
  id: string;
  name: string;
  description: string;
  value: string;
  enabled: boolean;
  recommended: boolean;
};

export type HostingConfigurationSelection = {
  type: "hosting_vps";
  controlPanelId: string;
  addonIds: string[];
  locationId: string;
};

export type ResolvedHostingConfiguration = {
  selection: HostingConfigurationSelection;
  controlPanel: HostingControlPanelOption | null;
  addons: HostingAddonOption[];
  location: HostingLocationOption | null;
  extraMonthlyPrice: number;
  summaryLines: string[];
};

export type HostingPlanDefinition = {
  tierCatalogKey: string;
  name: string;
  cores: number;
  ramMb: number;
  storageGb: number;
};

export type HostingProvisionRequest = {
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  serviceCatalogKey: string;
  tierCatalogKey: string;
  tierName: string;
  plan: HostingPlanDefinition;
  configuration: ResolvedHostingConfiguration;
};
