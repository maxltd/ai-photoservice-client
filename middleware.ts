import { NextResponse, type NextRequest } from "next/server";

const AUTH_DEBUG =
  process.env.AUTH_DEBUG === "true" ||
  process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "__Host-better-auth.session_token",
] as const;

export function middleware(request: NextRequest) {
  let matchedCookieName: string | null = null;

  const hasSessionToken = SESSION_COOKIE_NAMES.some((cookieName) => {
    const value = request.cookies.get(cookieName)?.value;
    const found = typeof value === "string" && value.length > 0;

    if (found) {
      matchedCookieName = cookieName;
    }

    return found;
  });


  if (hasSessionToken) {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("auth", "1");
  redirectUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/app/:path*"],
};
