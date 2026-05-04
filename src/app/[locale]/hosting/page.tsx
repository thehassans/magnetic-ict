import { notFound } from "next/navigation";
import { HostingServicePage } from "@/components/services/hosting-service-page";
import { getHostingProviderSettings } from "@/lib/platform-settings";
import { getServiceByIdWithOverrides } from "@/lib/service-overrides";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HostingPage() {
  const [service, hostingProviderConfig] = await Promise.all([
    getServiceByIdWithOverrides("magneticVpsHosting"),
    getHostingProviderSettings()
  ]);

  if (!service) {
    notFound();
  }

  return <HostingServicePage service={service} hostingProviderConfig={hostingProviderConfig} />;
}
