import { NextRequest, NextResponse } from "next/server";

// ─── Route definitions
const PUBLIC_ROUTES = ["/login"];
const ADMIN_PREFIX = "/admin";
const USER_PREFIX = "/dashboard";

// ─── Minimal JWT decode (no verify — signature check happens on the API) ──────
// As we only need the payload to read the `role` claim for routing decisions.
// The backend still verifies the signature on every real API call.
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // atob is available in the Next.js Edge runtime
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, any>): boolean {
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

// ─── Middleware
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Let public routes through immediately
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Read the token from the HTTP-only cookie set at login
  const token = request.cookies.get("accessToken")?.value;

  // No token
  if (!token) {
    // Trying to access any protected route → send to login
    if (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(USER_PREFIX)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Token present — decode payload
  const payload = decodeJwtPayload(token);

  // Malformed or expired token → clear cookie + redirect to login
  if (!payload || isTokenExpired(payload)) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    return response;
  }

  const role: string = payload.role ?? "";
  const isAdmin = role === "ADMIN";

  // ── Admin routes (/admin/*)
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isAdmin) {
      // Authenticated USER trying to access admin → send to their dashboard
      return NextResponse.redirect(new URL(USER_PREFIX, request.url));
    }
    return NextResponse.next();
  }

  // ── User routes (/dashboard/*)
  if (pathname.startsWith(USER_PREFIX)) {
    if (isAdmin) {
      // ADMIN accidentally hit /dashboard → send them to /admin
      return NextResponse.redirect(new URL(ADMIN_PREFIX, request.url));
    }
    return NextResponse.next();
  }

  // ── Root redirect (/)
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAdmin ? ADMIN_PREFIX : USER_PREFIX, request.url),
    );
  }

  return NextResponse.next();
}

// Route matcher — run middleware on every route except static assets
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public folder files (png, svg, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
