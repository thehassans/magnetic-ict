import { DomainCartClient } from "@/components/domains/domain-cart-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DomainCartPage() {
  return <DomainCartClient />;
}
