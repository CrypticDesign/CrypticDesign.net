import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { SINGULARIS_EXPERIENCE } from "@/lib/products";
import { resolveRequestExperienceAccess } from "@/lib/server-experience-access";
import { resolveSingularisRuntimeAsset } from "@/lib/singularis-runtime-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",
  "Referrer-Policy": "same-origin",
  "Vary": "Cookie",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

function hiddenResponse(status = 404) {
  return new NextResponse("Not found", { status, headers: PRIVATE_HEADERS });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetPath: string[] }> },
) {
  const authorization = await resolveRequestExperienceAccess(
    request,
    SINGULARIS_EXPERIENCE,
  );
  if (!authorization.access.executable) {
    return authorization.session.applyCookies(hiddenResponse());
  }

  const { assetPath } = await context.params;
  const asset = resolveSingularisRuntimeAsset(assetPath);
  if (!asset) return authorization.session.applyCookies(hiddenResponse());

  try {
    const body = await readFile(asset.absolutePath);
    return authorization.session.applyCookies(new NextResponse(body, {
      status: 200,
      headers: { ...PRIVATE_HEADERS, "Content-Type": asset.contentType },
    }));
  } catch {
    return authorization.session.applyCookies(hiddenResponse());
  }
}
