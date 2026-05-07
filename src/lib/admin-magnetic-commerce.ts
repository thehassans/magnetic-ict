import { findMongoDocuments } from "@/lib/social-bot-db";
import { magneticCommerceCollections, type MagneticCommerceInstallationRecord } from "@/lib/magnetic-commerce-db";

export async function getAdminMagneticCommerceInstallations() {
  return findMongoDocuments<MagneticCommerceInstallationRecord>(
    magneticCommerceCollections.installations,
    {},
    { sort: { createdAt: -1 }, limit: 500 }
  );
}
