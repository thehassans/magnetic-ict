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
};
