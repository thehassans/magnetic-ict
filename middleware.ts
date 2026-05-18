import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

const LOCALES = ["en", "fr", "ar", "de", "es", "tr", "bn"];

function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const hostname = (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    ?? request.nextUrl.hostname
    ?? request.headers.get("host")?.split(":")[0]
    ?? ""
  );
  const pathname = request.nextUrl.pathname;

  // Skip middleware for auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Skip chatbot subdomain rewrite for auth callback paths
  if (hostname.startsWith("chatbot.") && (pathname.includes("sign-in") || pathname.includes("sign-out") || pathname.includes("callback"))) {
    return NextResponse.next();
  }

  if (hostname.startsWith("chatbot.")) {
    const url = request.nextUrl.clone();
    const cleanPath = stripLocalePrefix(pathname);

    // Redirect /invite/* to the main domain so the token-redirect route handler runs
    if (cleanPath.startsWith("/invite/")) {
      const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://magnetic-ict.com";
      return NextResponse.redirect(`${mainDomain}${cleanPath}`);
    }

    // Rewrite root to /chatbot, other paths to /chatbot/path
    if (cleanPath === "/" || cleanPath === "") {
      url.pathname = "/chatbot";
    } else if (cleanPath.startsWith("/chatbot")) {
      url.pathname = cleanPath;
    } else {
      url.pathname = `/chatbot${cleanPath}`;
    }
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/chatbot")) {
    return NextResponse.next();
  }

  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"]
};
