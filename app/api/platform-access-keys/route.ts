import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  createStoredAccessKeyFile,
  getStoredAccessKeyFile,
  isBlobConfigured,
} from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as { accessKey?: string };
    const accessKey = String(payload.accessKey ?? "").trim();

    if (!accessKey) {
      return NextResponse.json({ error: "Access key is required." }, { status: 400 });
    }

    const storedFile = await createStoredAccessKeyFile({ accessKey });

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
