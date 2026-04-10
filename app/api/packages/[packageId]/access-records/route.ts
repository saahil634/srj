import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  getStoredAccessRecordFileForOwner,
  isBlobConfigured,
} from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ packageId: string }> },
) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const { packageId } = await context.params;
    const payload = (await request.json()) as {
      secureKey?: string;
      secureKeyFileId?: string;
      rootKey?: string;
      rootKeyFileId?: string;
    };
    const secureKey = String(payload.secureKey ?? payload.rootKey ?? "").trim();
    const secureKeyFileId =
      String(payload.secureKeyFileId ?? payload.rootKeyFileId ?? "").trim() || null;

    if (!secureKey) {
      return NextResponse.json({ error: "SRJ secure-key is required." }, { status: 400 });
    }

    const storedFile = await getStoredAccessRecordFileForOwner({
      packageId,
      rootKey: secureKey,
      rootKeyFileId: secureKeyFileId,
    });

    return new Response(storedFile.response.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${packageId}-access-records.txt"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to download the SRJ access records.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: message.includes("secure-key") || message.includes("root key") ? 403 : 500 },
    );
  }
}
