import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/api/auth/login", "/api/admin/seed"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname === "/sample-result.json"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("bi_session")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
    );
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    const analystOnly =
      pathname.startsWith("/connect") ||
      pathname.startsWith("/analyze") ||
      pathname === "/api/query" ||
      pathname.startsWith("/api/ai/") ||
      (pathname.startsWith("/api/connections") && request.method !== "GET") ||
      (pathname.startsWith("/api/dashboards") &&
        ["POST", "PUT", "DELETE"].includes(request.method));

    if (analystOnly && role !== "analyst") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboards", request.url));
    }
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
