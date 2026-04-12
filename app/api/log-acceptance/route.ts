import { NextResponse } from "next/server";

import {
  appendStoredAccessKeyAccessEvent,
  BLOB_CONFIG_ERROR,
  getAccessCookieName,
  getStoredPackage,
  isBlobConfigured,
  recordAcceptanceLog,
} from "@/lib/blob-storage";
import { AcceptancePayload } from "@/lib/types";

export const dynamic = "force-dynamic";

function getGeoSummary(request: Request) {
  const city = request.headers.get("x-vercel-ip-city")?.trim();
  const region = request.headers.get("x-vercel-ip-country-region")?.trim();
  const country = request.headers.get("x-vercel-ip-country")?.trim();
  const latitude = request.headers.get("x-vercel-ip-latitude")?.trim();
  const longitude = request.headers.get("x-vercel-ip-longitude")?.trim();

  const locationParts = [city, region, country].filter(Boolean);
  const coordinateSummary =
    latitude && longitude ? ` (${latitude}, ${longitude})` : "";

  return locationParts.length > 0
    ? `${locationParts.join(", ")}${coordinateSummary}`
    : null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AcceptancePayload>;

  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  if (!body.packageId || !body.fullName || !body.email || body.accepted !== true) {
    return NextResponse.json(
      { error: "Missing packageId, fullName, email, or acceptance flag." },
      { status: 400 },
    );
  }

  try {
    const pkg = await getStoredPackage(body.packageId);
    const log = await recordAcceptanceLog({
      packageId: body.packageId,
      fullName: body.fullName,
      organization: body.organization,
      email: body.email,
      accepted: true,
      accessorRootKey: body.accessorRootKey,
    });
    const accessKeyFileId = pkg.manifest.ownerRootKeyReference?.accessKeyFileId;

    if (accessKeyFileId) {
      try {
        await appendStoredAccessKeyAccessEvent({
          accessKeyId: accessKeyFileId,
          packageId: body.packageId,
          fullName: body.fullName,
          organization: body.organization,
          email: body.email,
          acceptedAt: log.acceptedAt,
          accessorRootKey: body.accessorRootKey,
          geoSummary: getGeoSummary(request),
        });
      } catch {
        // Acceptance should still succeed even if the optional text-file append fails.
      }
    }

    const response = NextResponse.json({
      packageId: body.packageId,
      acceptedAt: log.acceptedAt,
      governanceNotice: "Acceptance logged to persistent storage for demo purposes.",
    });

    response.cookies.set({
      name: getAccessCookieName(body.packageId),
      value: log.acceptedAt,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the terms acceptance event.",
      },
      { status: 500 },
    );
  }
}
