import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const pathname = request.nextUrl.pathname;

  if (hostname.startsWith("chatbot.")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/chatbot") ? pathname : `/chatbot${pathname}`;
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
