import { CheckoutPageContent } from "@/components/commerce/checkout-page-content";
import { getEnabledPaymentMethodIds, getPaymentIntegrationsSettings } from "@/lib/platform-settings";

export default async function CheckoutPage() {
  const paymentSettings = await getPaymentIntegrationsSettings();

  return <CheckoutPageContent availablePaymentMethods={getEnabledPaymentMethodIds(paymentSettings)} />;
}
