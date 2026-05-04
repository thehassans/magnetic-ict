import { getHostingProviderSettings } from "@/lib/platform-settings";
import { registerHostingProvisionDomainIfNeeded } from "@/lib/domain-provider";
import { createHostingProvisionId, getHostingProvisionByOrderId, upsertHostingProvision, type HostingProvisionRecord } from "@/lib/hosting-db";
import { getHostingPlanForTier } from "@/lib/hosting-plans";
import type { HostingProviderSettings, HostingProvisionAccess, HostingProvisionRequest } from "@/lib/hosting-types";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

type ResellerContractResponse = {
  id?: string;
  resellerReference?: string;
};

type ResellerAdminResponse = {
  id?: string;
};

type CloudDatacenterResponse = {
  id?: string;
};

type CloudServerResponse = {
  id?: string;
};

type CloudVolumeResponse = {
  id?: string;
};

async function requestJson<T>(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : `Provider request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

function createResellerAuthHeader(settings: HostingProviderSettings) {
  const token = Buffer.from(`${settings.resellerUsername}:${settings.resellerPassword}`).toString("base64");
  return `Basic ${token}`;
}

async function createResellerContract(settings: HostingProviderSettings, provision: HostingProvisionRecord) {
  const payload = await requestJson<ResellerContractResponse>(
    `${normalizeBaseUrl(settings.resellerBaseUrl)}/reseller/v2/contracts`,
    {
      method: "POST",
      headers: {
        Authorization: createResellerAuthHeader(settings),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: `${provision.customerEmail} Magnetic VPS`,
        resellerReference: provision.reseller.contractReference,
        resourceLimits: {
          ramServerMax: provision.plan.ramMb,
          cpuServerMax: provision.plan.cores,
          hddVolumeMaxSize: 0,
          ssdVolumeMaxSize: provision.plan.storageGb,
          ramContractMax: provision.plan.ramMb,
          cpuContractMax: provision.plan.cores,
          hddVolumeContractMaxSize: 0,
          ssdVolumeContractMaxSize: provision.plan.storageGb,
          ips: 1
        }
      })
    }
  );

  return payload.id ?? null;
}

async function createResellerAdmin(settings: HostingProviderSettings, contractId: string, provision: HostingProvisionRecord) {
  const payload = await requestJson<ResellerAdminResponse>(
    `${normalizeBaseUrl(settings.resellerBaseUrl)}/reseller/v2/contracts/${contractId}/admins`,
    {
      method: "POST",
      headers: {
        Authorization: createResellerAuthHeader(settings),
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        firstName: provision.customerName?.split(" ")[0] || "Magnetic",
        lastName: provision.customerName?.split(" ").slice(1).join(" ") || "Customer",
        email: provision.customerEmail,
        password: `${provision.orderId.slice(0, 8)}Magnetic1`
      })
    }
  );

  return payload.id ?? null;
}

function createCloudHeaders(settings: HostingProviderSettings) {
  return {
    Authorization: `Bearer ${settings.cloudToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(settings.cloudContractNumber ? { "X-Contract-Number": settings.cloudContractNumber } : {})
  };
}

async function createDatacenter(settings: HostingProviderSettings, provision: HostingProvisionRecord) {
  const payload = await requestJson<CloudDatacenterResponse>(
    `${normalizeBaseUrl(settings.cloudBaseUrl)}/cloudapi/v6/datacenters`,
    {
      method: "POST",
      headers: createCloudHeaders(settings),
      body: JSON.stringify({
        properties: {
          name: `${provision.customerEmail}-magnetic-vps`,
          description: `Magnetic VPS order ${provision.orderId}`,
          location: provision.plan.location
        }
      })
    }
  );

  return payload.id ?? null;
}

async function createServer(settings: HostingProviderSettings, datacenterId: string, provision: HostingProvisionRecord) {
  const payload = await requestJson<CloudServerResponse>(
    `${normalizeBaseUrl(settings.cloudBaseUrl)}/cloudapi/v6/datacenters/${datacenterId}/servers`,
    {
      method: "POST",
      headers: createCloudHeaders(settings),
      body: JSON.stringify({
        properties: {
          name: `${provision.tierName}-${provision.orderId.slice(-6)}`,
          type: "ENTERPRISE",
          cores: provision.plan.cores,
          ram: provision.plan.ramMb,
          availabilityZone: "AUTO"
        }
      })
    }
  );

  return payload.id ?? null;
}

async function attachBootVolume(settings: HostingProviderSettings, datacenterId: string, serverId: string, provision: HostingProvisionRecord) {
  const payload = await requestJson<CloudVolumeResponse>(
    `${normalizeBaseUrl(settings.cloudBaseUrl)}/cloudapi/v6/datacenters/${datacenterId}/servers/${serverId}/volumes`,
    {
      method: "POST",
      headers: createCloudHeaders(settings),
      body: JSON.stringify({
        properties: {
          name: `${provision.tierName} Boot Volume`,
          type: "SSD",
          size: provision.plan.storageGb,
          imageAlias: provision.plan.imageAlias,
          licenceType: "LINUX",
          bootOrder: "PRIMARY"
        }
      })
    }
  );

  return payload.id ?? null;
}

function buildCustomerPanelUrl(settings: HostingProviderSettings, provision: HostingProvisionRecord) {
  const template = settings.customerPanelUrlTemplate.trim();

  if (!template) {
    return null;
  }

  return template
    .replaceAll("{orderId}", provision.orderId)
    .replaceAll("{email}", encodeURIComponent(provision.customerEmail))
    .replaceAll("{contractId}", provision.reseller.contractId ?? "")
    .replaceAll("{adminId}", provision.reseller.adminId ?? "")
    .replaceAll("{serverId}", provision.cloud.serverId ?? "")
    .replaceAll("{datacenterId}", provision.cloud.datacenterId ?? "");
}

function createProvisionAccess(settings: HostingProviderSettings, request: HostingProvisionRequest, provision: HostingProvisionRecord): HostingProvisionAccess {
  const controlPanelId = request.configuration.controlPanel?.id ?? "none";
  const panel = controlPanelId === "plesk" || controlPanelId === "cpanel" || controlPanelId === "directadmin" ? controlPanelId : "none";
  const loginUrl = buildCustomerPanelUrl(settings, provision);

  return {
    panel,
    panelLabel: panel === "none" ? null : (settings.customerPanelLabel.trim() || request.configuration.controlPanel?.name || "Hosting panel"),
    loginUrl,
    username: provision.customerEmail,
    isReady: panel !== "none" && Boolean(loginUrl),
    notes: settings.customerPanelHelpText.trim() || null
  };
}

function createProvisionRecord(request: HostingProvisionRequest, settings: HostingProviderSettings): HostingProvisionRecord {
  const now = new Date().toISOString();
  const provision: HostingProvisionRecord = {
    _id: createHostingProvisionId(),
    orderId: request.orderId,
    userId: request.userId,
    customerEmail: request.customerEmail,
    customerName: request.customerName,
    serviceCatalogKey: request.serviceCatalogKey,
    tierCatalogKey: request.tierCatalogKey,
    tierName: request.tierName,
    provider: "ionos",
    status: "pending",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    provisionedAt: null,
    plan: {
      cores: request.plan.cores,
      ramMb: request.plan.ramMb,
      storageGb: request.plan.storageGb,
      imageAlias: request.configuration.operatingSystem?.imageAlias ?? settings.defaultImageAlias,
      location: request.configuration.location?.value ?? settings.defaultLocation
    },
    configuration: {
      operatingSystemName: request.configuration.operatingSystem?.name ?? null,
      controlPanelName: request.configuration.controlPanel?.name ?? null,
      addonNames: request.configuration.addons.map((addon) => addon.name),
      locationName: request.configuration.location?.name ?? null,
      extraMonthlyPrice: request.configuration.extraMonthlyPrice,
      summaryLines: request.configuration.summaryLines
    },
    domain: {
      mode: request.configuration.domain.mode,
      name: request.configuration.domain.name,
      years: request.configuration.domain.years,
      privacyProtection: request.configuration.domain.privacyProtection,
      unitPrice: request.configuration.domain.unitPrice,
      totalPrice: request.configuration.domain.totalPrice,
      status: request.configuration.domain.mode === "register" ? "pending" : "not_requested",
      registrarReference: null,
      errorMessage: null
    },
    reseller: {
      contractId: null,
      adminId: null,
      contractReference: `magnetic-${request.orderId}`
    },
    cloud: {
      contractNumber: settings.cloudContractNumber || null,
      datacenterId: null,
      serverId: null,
      volumeId: null,
      location: request.configuration.location?.value ?? settings.defaultLocation
    },
    access: {
      panel: "none",
      panelLabel: null,
      loginUrl: null,
      username: null,
      isReady: false,
      notes: null
    }
  };

  provision.access = createProvisionAccess(settings, request, provision);
  return provision;
}

export async function provisionMagneticVpsHosting(request: HostingProvisionRequest) {
  const settings = await getHostingProviderSettings();
  const existing = await getHostingProvisionByOrderId(request.orderId);
  const provision = existing ?? createProvisionRecord(request, settings);
  const legacyProvision = provision as HostingProvisionRecord & {
    domain?: Partial<HostingProvisionRecord["domain"]>;
    configuration?: Partial<HostingProvisionRecord["configuration"]>;
  };

  provision.domain = {
    mode: legacyProvision.domain?.mode ?? request.configuration.domain.mode,
    name: legacyProvision.domain?.name ?? request.configuration.domain.name,
    years: legacyProvision.domain?.years ?? request.configuration.domain.years,
    privacyProtection: legacyProvision.domain?.privacyProtection ?? request.configuration.domain.privacyProtection,
    unitPrice: legacyProvision.domain?.unitPrice ?? request.configuration.domain.unitPrice,
    totalPrice: legacyProvision.domain?.totalPrice ?? request.configuration.domain.totalPrice,
    status: legacyProvision.domain?.status ?? (request.configuration.domain.mode === "register" ? "pending" : "not_requested"),
    registrarReference: legacyProvision.domain?.registrarReference ?? null,
    errorMessage: legacyProvision.domain?.errorMessage ?? null
  };

  provision.configuration = {
    operatingSystemName: legacyProvision.configuration?.operatingSystemName ?? request.configuration.operatingSystem?.name ?? null,
    controlPanelName: legacyProvision.configuration?.controlPanelName ?? request.configuration.controlPanel?.name ?? null,
    addonNames: legacyProvision.configuration?.addonNames ?? request.configuration.addons.map((addon) => addon.name),
    locationName: legacyProvision.configuration?.locationName ?? request.configuration.location?.name ?? null,
    extraMonthlyPrice: legacyProvision.configuration?.extraMonthlyPrice ?? request.configuration.extraMonthlyPrice,
    summaryLines: legacyProvision.configuration?.summaryLines ?? request.configuration.summaryLines
  };

  provision.plan.imageAlias = request.configuration.operatingSystem?.imageAlias ?? provision.plan.imageAlias;
  provision.cloud.location = request.configuration.location?.value ?? provision.cloud.location;
  provision.access = existing?.access?.isReady ? existing.access : createProvisionAccess(settings, request, provision);

  provision.updatedAt = new Date().toISOString();
  provision.errorMessage = null;

  if (!settings.enabled) {
    provision.status = "pending";
    await upsertHostingProvision(provision);
    return provision;
  }

  if (settings.mode === "manual") {
    provision.status = "pending";
    await upsertHostingProvision(provision);
    return provision;
  }

  try {
    if (settings.createResellerContracts && !provision.reseller.contractId) {
      provision.reseller.contractId = await createResellerContract(settings, provision);
      provision.status = "contract_created";
      provision.updatedAt = new Date().toISOString();
      await upsertHostingProvision(provision);
    }

    if (settings.createContractAdmins && provision.reseller.contractId && !provision.reseller.adminId) {
      provision.reseller.adminId = await createResellerAdmin(settings, provision.reseller.contractId, provision);
      provision.status = "admin_created";
      provision.updatedAt = new Date().toISOString();
      await upsertHostingProvision(provision);
    }

    if (!provision.cloud.datacenterId) {
      provision.cloud.datacenterId = await createDatacenter(settings, provision);
      provision.status = "datacenter_created";
      provision.updatedAt = new Date().toISOString();
      await upsertHostingProvision(provision);
    }

    if (provision.cloud.datacenterId && !provision.cloud.serverId) {
      provision.cloud.serverId = await createServer(settings, provision.cloud.datacenterId, provision);
      provision.status = "server_created";
      provision.updatedAt = new Date().toISOString();
      await upsertHostingProvision(provision);
    }

    if (provision.cloud.datacenterId && provision.cloud.serverId && !provision.cloud.volumeId) {
      provision.cloud.volumeId = await attachBootVolume(settings, provision.cloud.datacenterId, provision.cloud.serverId, provision);
      provision.status = "volume_attached";
      provision.updatedAt = new Date().toISOString();
      await upsertHostingProvision(provision);
    }

    if (provision.domain.mode === "register") {
      await registerHostingProvisionDomainIfNeeded(provision);
    }

    provision.status = "provisioned";
    provision.provisionedAt = new Date().toISOString();
    provision.updatedAt = provision.provisionedAt;
    await upsertHostingProvision(provision);
    return provision;
  } catch (error) {
    provision.status = "failed";
    provision.updatedAt = new Date().toISOString();
    provision.errorMessage = error instanceof Error ? error.message : "Provisioning failed.";
    await upsertHostingProvision(provision);
    throw error;
  }
}

export function createProvisionRequestFromOrder(args: {
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  serviceCatalogKey: string;
  tierCatalogKey: string;
  tierName: string;
  configuration: HostingProvisionRequest["configuration"];
}) {
  const plan = getHostingPlanForTier(args.tierCatalogKey);

  if (!plan) {
    throw new Error("Unsupported Magnetic VPS Hosting tier.");
  }

  return {
    ...args,
    plan
  } satisfies HostingProvisionRequest;
}
