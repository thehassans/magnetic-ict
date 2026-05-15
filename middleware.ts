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

  if (hostname.startsWith("chatbot.")) {
    const url = request.nextUrl.clone();
    const cleanPath = stripLocalePrefix(pathname);
    url.pathname = cleanPath.startsWith("/chatbot")
      ? cleanPath
      : `/chatbot${cleanPath === "/" ? "" : cleanPath}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-forwarded-host", hostname);
    response.headers.set("x-chatbot-host", hostname);
    return response;
  }

  if (pathname.startsWith("/chatbot")) {
    return NextResponse.next();
  }

  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"]
};
