import { prisma } from "../src/lib/prisma";

async function main() {
  const rawEmail = process.argv[2] ?? process.env.ADMIN_EMAIL;
  const email = rawEmail?.trim().toLowerCase();

  if (!email) {
    throw new Error("Provide an email as the first argument or set ADMIN_EMAIL.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      emailVerified: new Date()
    },
    create: {
      email,
      role: "ADMIN",
      emailVerified: new Date()
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  console.log(`Admin access granted to ${user.email} (${user.role}).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
