import { type Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAboutSettings } from "@/lib/platform-settings";
import { AboutPageContent } from "@/components/about/about-page-content";

export const metadata: Metadata = {
  title: "About | Magnetic ICT",
  description: "Magnetic ICT is the technology sister branch of Magnetic Infratech Ltd — powering cloud tools, AI infrastructure, security, and growth systems for ambitious businesses worldwide."
};

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const about = await getAboutSettings();

  return <AboutPageContent about={about} />;
}
