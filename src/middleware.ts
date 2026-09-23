import { NextRequest, NextResponse } from "next/server";

import { indexingDirectiveForRequest } from "@/lib/indexing-policy";

export function middleware(request: NextRequest) {
  const publicHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const directive = indexingDirectiveForRequest(publicHost, request.nextUrl.pathname);
  const response = NextResponse.next();

  if (directive) response.headers.set("X-Robots-Tag", directive);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
