import { notFound } from "next/navigation";
import { getPortfolioSiteById } from "@/lib/portfolio-db";
import { AuroraTemplate } from "@/components/portfolio/template-aurora";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicPortfolioPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);

  if (!site || site.status !== "ACTIVE") notFound();

  return <AuroraTemplate site={site} />;
}
