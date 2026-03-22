import { NextResponse } from "next/server";
import { warmRegistryCache } from "@br/registry";

export async function POST(request: Request) {
  const providedKey = request.headers.get("x-admin-key");
  const expectedKey = process.env.X_ADMIN_KEY;

  if (!expectedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await warmRegistryCache(true);

  return NextResponse.json({ status: "ok" });
}
