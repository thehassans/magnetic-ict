import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "active_languages" },
    update: {
      value: [
        { code: "en", label: "English", direction: "ltr" },
        { code: "fr", label: "Français", direction: "ltr" },
        { code: "ar", label: "العربية", direction: "rtl" }
      ]
    },
    create: {
      key: "active_languages",
      value: [
        { code: "en", label: "English", direction: "ltr" },
        { code: "fr", label: "Français", direction: "ltr" },
        { code: "ar", label: "العربية", direction: "rtl" }
      ]
    }
  });

  await prisma.setting.upsert({
    where: { key: "footer_details" },
    update: {
      value: {
        company: "MagneticICT",
        email: "support@magnetic-ict.com",
        phone: "+447988525331"
      }
    },
    create: {
      key: "footer_details",
      value: {
        company: "MagneticICT",
        email: "support@magnetic-ict.com",
        phone: "+447988525331"
      }
    }
  });

  await prisma.setting.upsert({
    where: { key: "gemini_api_key" },
    update: {
      value: {
        configured: false,
        value: null
      }
    },
    create: {
      key: "gemini_api_key",
      value: {
        configured: false,
        value: null
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
