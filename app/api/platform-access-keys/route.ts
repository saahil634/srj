import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  createStoredAccessKeyFile,
  getStoredAccessKeyFile,
  updateStoredRootKeyProfile,
  isBlobConfigured,
} from "@/lib/blob-storage";

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
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      accessKey?: string;
      ownerName?: string;
      ownerEmail?: string;
    };
    const accessKey = String(payload.accessKey ?? "").trim();
    const ownerName = String(payload.ownerName ?? "").trim() || null;
    const ownerEmail = String(payload.ownerEmail ?? "").trim() || null;

    if (!accessKey) {
      return NextResponse.json({ error: "Access key is required." }, { status: 400 });
    }

    const storedFile = await createStoredAccessKeyFile({
      accessKey,
      geoSummary: getGeoSummary(request),
      ownerName,
      ownerEmail,
    });

    return NextResponse.json({
      accessKeyId: storedFile.accessKeyId,
      downloadUrl: `/api/platform-access-keys?accessKeyId=${storedFile.accessKeyId}`,
      fileName: storedFile.fileName,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to store the SRJ access key file.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      accessKeyId?: string;
      ownerName?: string;
      ownerEmail?: string;
    };
    const accessKeyId = String(payload.accessKeyId ?? "").trim();
    const ownerName = String(payload.ownerName ?? "").trim() || null;
    const ownerEmail = String(payload.ownerEmail ?? "").trim() || null;

    if (!accessKeyId) {
      return NextResponse.json({ error: "Access key ID is required." }, { status: 400 });
    }

    const record = await updateStoredRootKeyProfile({
      accessKeyId,
      ownerName,
      ownerEmail,
    });

    return NextResponse.json({
      accessKeyId: record.accessKeyId,
      ownerName: record.ownerName,
      ownerEmail: record.ownerEmail,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the SRJ root-key profile.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accessKeyId = searchParams.get("accessKeyId")?.trim() ?? "";

    if (!accessKeyId) {
      return NextResponse.json({ error: "Access key ID is required." }, { status: 400 });
    }

    const storedFile = await getStoredAccessKeyFile(accessKeyId);

    return new Response(storedFile.response.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${storedFile.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to download the SRJ access key file.",
      },
      { status: 500 },
    );
  }
}
