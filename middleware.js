import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authToken";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // We need to check isAdmin from DB, but middleware can't access Prisma easily
    // So we do a lightweight check by fetching the user API
    try {
      const res = await fetch(new URL("/api/auth", request.url), {
        headers: { Cookie: `auth-token=${token}` },
      });
      const data = await res.json();
      if (!data.user?.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
