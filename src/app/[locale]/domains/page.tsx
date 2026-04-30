import { DomainSearchClient } from "@/components/domains/domain-search-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DomainsPage() {
  return <DomainSearchClient />;
}
