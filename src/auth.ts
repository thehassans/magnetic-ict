import { PrismaAdapter } from "@auth/prisma-adapter";
import { timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { getConfiguredAdminEmail, getConfiguredAdminPasswordCandidates } from "@/lib/admin-credentials";
import { sendWelcomeEmail } from "@/lib/email";
import { hashOtpCode } from "@/lib/otp";
import { defaultOAuthConfig, getOAuthSettings, getResolvedOAuthSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";
import type { AppUserRole } from "@/types/auth";

const otpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().regex(/^\d{6}$/)
});

const adminCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const hasDatabase = Boolean(process.env.DATABASE_URL);
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV !== "production" ? "magneticict-dev-secret" : undefined);
const defaultUserRole: AppUserRole = "USER";
const canonicalAuthUrl = process.env.AUTH_URL?.replace(/\/$/, "")
  || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
  || process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  || null;

if (authSecret) {
  process.env.AUTH_SECRET ??= authSecret;
  process.env.NEXTAUTH_SECRET ??= authSecret;
}

if (canonicalAuthUrl) {
  process.env.AUTH_URL ??= canonicalAuthUrl;
  process.env.NEXTAUTH_URL ??= canonicalAuthUrl;
}

function getParentDomain(): string | undefined {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
  if (!url) return undefined;
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1") return undefined;
    const parts = hostname.split(".");
    if (parts.length >= 2) return `.${parts.slice(-2).join(".")}`;
  } catch { /* ignore */ }
  return undefined;
}

function compareSecret(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

function createBaseProviders(): Provider[] {
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

        const configuredEmail = getConfiguredAdminEmail();
        const configuredPasswords = getConfiguredAdminPasswordCandidates();
        const email = credentials.data.email.trim().toLowerCase();

        if (!configuredEmail || configuredPasswords.length === 0 || email !== configuredEmail) {
          return null;
        }

        if (!configuredPasswords.some((configuredPassword) => compareSecret(credentials.data.password, configuredPassword))) {
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

          const email = credentials.data.email;
          const { code } = credentials.data;
          const now = new Date();
          const tokenHash = hashOtpCode(code);
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
          });

          const otpRecord = await prisma.emailOtp.findFirst({
            where: {
              email,
              consumedAt: null
            },
            orderBy: {
              createdAt: "desc"
            }
          });

          if (!otpRecord) {
            console.warn("[auth] OTP verification failed", { reason: "missing_active_code", emailDomain: email.split("@")[1] ?? "", codeLength: code.length });
            return null;
          }

          if (otpRecord.expiresAt <= now) {
            console.warn("[auth] OTP verification failed", { reason: "expired_code", emailDomain: email.split("@")[1] ?? "", codeLength: code.length });
            return null;
          }

          if (otpRecord.tokenHash !== tokenHash) {
            console.warn("[auth] OTP verification failed", { reason: "code_mismatch", emailDomain: email.split("@")[1] ?? "", codeLength: code.length });
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

          if (!existingUser) {
            void sendWelcomeEmail({ email: user.email, customerName: user.name }).catch(() => null);
          }

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

  return providers;
}

async function buildProviders() {
  const rawOAuthSettings = hasDatabase
    ? await getOAuthSettings().catch((error) => {
        console.error("[auth] Failed to load OAuth settings", error);
        return defaultOAuthConfig;
      })
    : defaultOAuthConfig;
  const oauthSettings = getResolvedOAuthSettings(rawOAuthSettings);
  const oauthProviders: Provider[] = [];

  if (oauthSettings.google.enabled && oauthSettings.google.clientId && oauthSettings.google.clientSecret) {
    oauthProviders.push(
      Google({
        clientId: oauthSettings.google.clientId,
        clientSecret: oauthSettings.google.clientSecret,
        authorization: {
          params: {
            scope: "openid email profile",
            response_mode: "form_post"
          }
        }
      })
    );
  }

  if (oauthSettings.github.enabled && oauthSettings.github.clientId && oauthSettings.github.clientSecret) {
    oauthProviders.push(
      GitHub({
        clientId: oauthSettings.github.clientId,
        clientSecret: oauthSettings.github.clientSecret
      })
    );
  }

  if (oauthSettings.apple.enabled && oauthSettings.apple.clientId && oauthSettings.apple.clientSecret) {
    oauthProviders.push(
      Apple({
        clientId: oauthSettings.apple.clientId,
        clientSecret: oauthSettings.apple.clientSecret
      })
    );
  }

  return [...oauthProviders, ...createBaseProviders()];
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getParentDomain()
      }
    },
    state: {
      options: {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
        secure: true
      }
    },
    pkceCodeVerifier: {
      options: {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
        secure: true
      }
    },
    nonce: {
      options: {
        httpOnly: true,
        sameSite: "none" as const,
        path: "/",
        secure: true
      }
    }
  },
  providers: await buildProviders(),
  events: {
    async createUser({ user }) {
      if (!user.email || user.role === "ADMIN") {
        return;
      }

      void sendWelcomeEmail({ email: user.email, customerName: user.name }).catch(() => null);
    }
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        const baseParts = baseObj.hostname.split(".");
        if (baseParts.length >= 2) {
          const parentDomain = baseParts.slice(-2).join(".");
          if (urlObj.hostname === parentDomain || urlObj.hostname.endsWith(`.${parentDomain}`)) {
            return url;
          }
        }
      } catch { /* ignore */ }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as AppUserRole | undefined) ?? defaultUserRole;
      }

      if (hasDatabase && !token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        }).catch((error) => {
          console.error("[auth] Failed to load session user role", error);
          return null;
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
}));
