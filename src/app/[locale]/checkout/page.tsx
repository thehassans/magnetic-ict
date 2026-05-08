import { CheckoutPageContent } from "@/components/commerce/checkout-page-content";
import { getEnabledPaymentMethodIds, getPaymentIntegrationsSettings, getHostingProviderSettings } from "@/lib/platform-settings";

export default async function CheckoutPage() {
  const paymentSettings = await getPaymentIntegrationsSettings();
  const hostingProviderConfig = await getHostingProviderSettings();

  return <CheckoutPageContent availablePaymentMethods={getEnabledPaymentMethodIds(paymentSettings)} hostingProviderConfig={hostingProviderConfig} />;
}
