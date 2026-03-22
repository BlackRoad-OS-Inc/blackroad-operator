import { NextRequest, NextResponse } from "next/server";
import { emit, projectorFromDimension } from "@br/qlm";

export function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const { method, nextUrl } = request;
  const tau = Number(process.env.TRUST_THRESHOLD ?? 0.62);
  const declaredTrust = Number(request.headers.get("x-agent-trust") ?? "0");
  const trust = Number.isFinite(declaredTrust) && declaredTrust > 0 ? declaredTrust : method === "GET" ? 0.82 : 0.7;
  const projector = projectorFromDimension(1);
  const action = [method === "GET" ? 1 : 0.88];
  const emission = emit(action, { P: projector, T: trust, tau });

  const logEntry = {
    kind: "trust_gate",
    requestId,
    method,
    path: nextUrl.pathname,
    trust,
    threshold: tau,
    allowed: emission !== null,
    timestamp: new Date().toISOString(),
  } satisfies Record<string, unknown>;
  console.log(JSON.stringify(logEntry));

  if (!emission) {
    return new NextResponse(JSON.stringify({ error: "trust_gate_blocked" }), {
      status: 403,
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-trust-threshold", tau.toString());
  response.headers.set("x-agent-trust", trust.toFixed(3));
  return response;
}

export const config = {
  matcher: "/:path*",
};
