import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const { method, nextUrl } = request;
  console.log(`[request] id=${requestId} method=${method} path=${nextUrl.pathname}`);
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: "/:path*",
};
