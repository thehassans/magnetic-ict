import { PrismaAdapter } from "@auth/prisma-adapter";
import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { hashOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import type { AppUserRole } from "@/types/auth";

const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

const adminCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const hasDatabase = Boolean(process.env.DATABASE_URL);
const authSecret = process.env.AUTH_SECRET || (process.env.NODE_ENV !== "production" ? "magneticict-dev-secret" : undefined);
const defaultUserRole: AppUserRole = "USER";

function compareSecret(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

const providers: Provider[] = [];

providers.push(
  Credentials({
    id: "admin-credentials",
    name: "Admin Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(rawCredentials) {
      const credentials = adminCredentialsSchema.safeParse(rawCredentials);

      if (!credentials.success) {
        return null;
      }

      const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const configuredPassword = process.env.ADMIN_PASSWORD ?? "";
      const email = credentials.data.email.trim().toLowerCase();

      if (!configuredEmail || !configuredPassword || email !== configuredEmail) {
        return null;
      }

      if (!compareSecret(credentials.data.password, configuredPassword)) {
        return null;
      }

      if (!hasDatabase) {
        return {
          id: "env-admin",
          email: configuredEmail,
          name: "Administrator",
          role: "ADMIN" as const
        };
      }

      const now = new Date();
      const user = await prisma.user.upsert({
        where: { email: configuredEmail },
        update: {
          role: "ADMIN",
          emailVerified: now
        },
        create: {
          email: configuredEmail,
          role: "ADMIN",
          emailVerified: now,
          name: "Administrator"
        }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role
      };
    }
  })
);

if (hasDatabase) {
  providers.push(
    Credentials({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" }
      },
      async authorize(rawCredentials) {
        const credentials = otpSchema.safeParse(rawCredentials);

        if (!credentials.success) {
          return null;
        }

        const email = credentials.data.email.toLowerCase();
        const { code } = credentials.data;
        const now = new Date();
        const tokenHash = hashOtpCode(code);

        const otpRecord = await prisma.emailOtp.findFirst({
          where: {
            email,
            tokenHash,
            consumedAt: null,
            expiresAt: {
              gt: now
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        if (!otpRecord) {
          return null;
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            emailVerified: now
          },
          create: {
            email,
            emailVerified: now,
            role: defaultUserRole
          }
        });

        await prisma.emailOtp.update({
          where: {
            id: otpRecord.id
          },
          data: {
            consumedAt: now
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        };
      }
    })
  );
}

if (hasDatabase && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  secret: authSecret,
  session: {
    strategy: "jwt"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as AppUserRole | undefined) ?? defaultUserRole;
      }

      if (hasDatabase && !token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });

        token.role = (dbUser?.role as AppUserRole | undefined) ?? defaultUserRole;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AppUserRole | undefined) ?? defaultUserRole;
      }

      return session;
    }
  }
});
