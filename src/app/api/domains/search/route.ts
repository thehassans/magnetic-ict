import { NextResponse } from "next/server";
import { searchDomains } from "@/lib/domain-search";
import { getDomainProviderSettings } from "@/lib/platform-settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const settings = await getDomainProviderSettings();

  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      defaultYears: settings.defaultYears,
      domainsEnabled: settings.enabled,
      providerLabel: settings.providerLabel,
      includePrivacyProtectionByDefault: settings.includePrivacyProtectionByDefault,
      checkoutProvider: settings.checkoutProvider
    });
  }

  try {
    const results = await searchDomains(query);
    return NextResponse.json({
      results,
      defaultYears: settings.defaultYears,
      domainsEnabled: settings.enabled,
      providerLabel: settings.providerLabel,
      includePrivacyProtectionByDefault: settings.includePrivacyProtectionByDefault,
      checkoutProvider: settings.checkoutProvider
    });
  } catch (error) {
    console.error("Domain search failed", error);
    return NextResponse.json({ error: "Unable to search domains right now." }, { status: 500 });
  }
}
