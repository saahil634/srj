import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  createStoredMetadataLayer,
  getAccessCookieName,
  getStoredPackage,
  isBlobConfigured,
  listStoredMetadataLayers,
} from "@/lib/blob-storage";
import { MetadataLayerLog, MetadataLayerType } from "@/lib/types";

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

function normalizeLayerType(value: string): MetadataLayerType | null {
  const normalized = value.trim() as MetadataLayerType;
  const allowedValues: MetadataLayerType[] = [
    "translation",
    "annotation",
    "summary",
    "context-note",
    "rights-note",
    "cultural-sensitivity-note",
    "educational-note",
    "transcription",
    "other",
  ];

  return allowedValues.includes(normalized) ? normalized : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ packageId: string }> },
) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        metadataLayers: [],
        error: BLOB_CONFIG_ERROR,
      },
      { status: 503 },
    );
  }

  try {
    const { packageId } = await context.params;
    const metadataLayers = await listStoredMetadataLayers(packageId);

    return NextResponse.json({ metadataLayers });
  } catch (error) {
    return NextResponse.json(
      {
        metadataLayers: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load metadata layers for this SRJ package.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ packageId: string }> },
) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const { packageId } = await context.params;
    const cookieStore = await cookies();
    const payload = (await request.json()) as Partial<MetadataLayerLog> & {
      fileIds?: string[];
      layerType?: string;
    };
    const fileIds = Array.isArray(payload.fileIds)
      ? payload.fileIds.map((value) => String(value))
      : [];
    const layerType = normalizeLayerType(String(payload.layerType ?? ""));
    const layerTitle = String(payload.layerTitle ?? "").trim();
    const description = String(payload.description ?? "").trim();
    const language = String(payload.language ?? "").trim() || null;
    const storedPackage = await getStoredPackage(packageId);
    const accessCookie = cookieStore.get(getAccessCookieName(packageId));
    const ownerRootKeyFileId = storedPackage.manifest.ownerRootKeyReference?.accessKeyFileId ?? null;
    const requesterRootKeyFileId = payload.createdBy?.rootKeyFileId?.trim() || null;
    const isOwnerSession =
      payload.createdBy?.keyType === "secure-key" &&
      Boolean(ownerRootKeyFileId) &&
      requesterRootKeyFileId === ownerRootKeyFileId;
    const hasUnlockedPackage = Boolean(accessCookie);

    if (!isOwnerSession && !hasUnlockedPackage) {
      return NextResponse.json(
        {
          error:
            "Unlock this package in the current session, or use the matching owner SRJ-root key session before adding a metadata layer.",
        },
        { status: 403 },
      );
    }

    if (!layerType) {
      return NextResponse.json(
        { error: "A valid metadata layer type is required." },
        { status: 400 },
      );
    }

    if (fileIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one package file." },
        { status: 400 },
      );
    }

    if (!layerTitle) {
      return NextResponse.json(
        { error: "A metadata layer title is required." },
        { status: 400 },
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "A metadata layer description is required." },
        { status: 400 },
      );
    }

    const metadataLayer = await createStoredMetadataLayer({
      packageId,
      fileIds,
      createdBy: {
        rootKeyFileId: payload.createdBy?.rootKeyFileId ?? null,
        rootKeyValue: payload.createdBy?.rootKeyValue ?? null,
        name: payload.createdBy?.name ?? null,
        email: payload.createdBy?.email ?? null,
        organization: payload.createdBy?.organization ?? null,
        keyType: payload.createdBy?.keyType === "access-key" ? "access-key" : "secure-key",
      },
      sourceAccess: {
        accessorRootKey: payload.sourceAccess?.accessorRootKey ?? null,
      },
      layerType,
      layerTitle,
      language,
      description,
      geoSummary: getGeoSummary(request),
      payload:
        payload.payload && typeof payload.payload === "object" && !Array.isArray(payload.payload)
          ? (payload.payload as Record<string, string | string[] | null>)
          : {},
    });

    return NextResponse.json({ metadataLayer });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the metadata layer.",
      },
      { status: 500 },
    );
  }
}
