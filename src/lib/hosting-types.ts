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
  customerPanelLabel: string;
  customerPanelUrlTemplate: string;
  customerPanelHelpText: string;
  operatingSystems: HostingOperatingSystemOption[];
  controlPanels: HostingControlPanelOption[];
  addons: HostingAddonOption[];
  locations: HostingLocationOption[];
};

export type HostingOperatingSystemOption = {
  id: string;
  name: string;
  description: string;
  imageAlias: string;
  enabled: boolean;
  recommended: boolean;
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
  operatingSystemId: string;
  controlPanelId: string;
  addonIds: string[];
  locationId: string;
  domainMode: "none" | "register";
  domainName: string;
  domainYears: number;
  domainPrivacyProtection: boolean;
  domainUnitPrice: number;
};

export type ResolvedHostingConfiguration = {
  selection: HostingConfigurationSelection;
  operatingSystem: HostingOperatingSystemOption | null;
  controlPanel: HostingControlPanelOption | null;
  addons: HostingAddonOption[];
  location: HostingLocationOption | null;
  extraMonthlyPrice: number;
  domainRegistrationPrice: number;
  totalPriceAdjustment: number;
  domain: {
    mode: "none" | "register";
    name: string | null;
    years: number;
    privacyProtection: boolean;
    unitPrice: number;
    totalPrice: number;
  };
  summaryLines: string[];
};

export type HostingPlanDefinition = {
  tierCatalogKey: string;
  name: string;
  cores: number;
  ramMb: number;
  storageGb: number;
};

export type HostingAccessPanelType = "none" | "plesk" | "cpanel" | "directadmin" | "custom";

export type HostingProvisionAccess = {
  panel: HostingAccessPanelType;
  panelLabel: string | null;
  loginUrl: string | null;
  username: string | null;
  isReady: boolean;
  notes: string | null;
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
