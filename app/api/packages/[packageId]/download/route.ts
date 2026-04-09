import JSZip from "jszip";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getAccessCookieName,
  getPrivateBlob,
  getStoredPackage,
  isBlobConfigured,
} from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

function sanitizeZipName(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "-");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ packageId: string }> },
) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  const { packageId } = await context.params;
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(getAccessCookieName(packageId));

  if (!accessCookie) {
    return NextResponse.json(
      { error: "Terms must be accepted before the package ZIP can be downloaded." },
      { status: 403 },
    );
  }

  try {
    const storedPackage = await getStoredPackage(packageId);
    const zip = new JSZip();

    zip.file("manifest.json", JSON.stringify(storedPackage.manifest, null, 2));

    for (const asset of storedPackage.assets) {
      if (!asset.pathname) {
        continue;
      }

      const blob = await getPrivateBlob(asset.pathname);
      const arrayBuffer = await new Response(blob.stream).arrayBuffer();

      zip.file(`files/${asset.fileId}-${sanitizeZipName(asset.name)}`, arrayBuffer);
    }

    const zipBuffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });
    const zipBody = new Uint8Array(zipBuffer.byteLength);
    zipBody.set(zipBuffer);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(zipBody);
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packageId}.zip"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the package ZIP.",
      },
      { status: 500 },
    );
  }
}
