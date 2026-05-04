import { CartPageContent } from "@/components/commerce/cart-page-content";
import { getHostingProviderSettings } from "@/lib/platform-settings";

export default async function CartPage() {
  const hostingProviderConfig = await getHostingProviderSettings();

  return <CartPageContent hostingProviderConfig={hostingProviderConfig} />;
}
