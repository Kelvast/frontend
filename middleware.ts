import { NextRequest, NextResponse } from "next/server";

const GUARDED = ["/login", "/register", "/dashboard", "/game", "/map-builder"];

export function middleware(req: NextRequest): NextResponse {
  const open = process.env.NEXT_PUBLIC_EARLY_ACCESS === "true";
  if (open) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const guarded = GUARDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (guarded) return NextResponse.redirect(new URL("/", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)"],
};
