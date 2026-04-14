import { CustomerSignInClient } from "@/components/auth/customer-sign-in-client";
import { getOAuthProviderAvailability, getOAuthSettings } from "@/lib/platform-settings";

export default async function CustomerSignInPage() {
  const oauthSettings = await getOAuthSettings();
  const providerAvailability = getOAuthProviderAvailability(oauthSettings);

  return <CustomerSignInClient providerAvailability={providerAvailability} />;
}
