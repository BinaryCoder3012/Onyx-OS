import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-onyx-version", "0.1.0");

  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("x-onyx-api", "true");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
