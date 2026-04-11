import JSZip from "jszip";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getAccessCookieName,
  getPrivateBlob,
  recordDerivativeErrorLog,
  getStoredPackage,
  isBlobConfigured,
} from "@/lib/blob-storage";
import {
  buildDerivativePackageEntryName,
  createDerivativeFile,
} from "@/lib/download-derivatives";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    const { ownerRootKeyReference: _ownerRootKeyReference, ...publicManifest } =
      storedPackage.manifest;
    const zip = new JSZip();
    const derivativeEntries: Array<Record<string, unknown>> = [];
    const derivativeErrors: Array<Record<string, unknown>> = [];

    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          ...publicManifest,
          derivativePackage: {
            generatedAt: new Date().toISOString(),
            description:
              "Recipient ZIP contains web-optimized derivative files and per-file manifest sidecars. Originals remain unchanged in secure storage.",
          },
        },
        null,
        2,
      ),
    );

    for (const asset of storedPackage.assets) {
      if (!asset.pathname) {
        continue;
      }

      const blob = await getPrivateBlob(asset.pathname);
      const arrayBuffer = await new Response(blob.stream).arrayBuffer();
      const input = new Uint8Array(arrayBuffer);
      const derivative = await createDerivativeFile(input, storedPackage.manifest, asset);
      const derivativeFileName = buildDerivativePackageEntryName(
        asset,
        derivative.derivativeExtension,
      );
      const derivativeFolder = `files/${asset.fileId}-${sanitizeZipName(asset.name)}`;

      if (derivative.errorLog) {
        const errorRecord = await recordDerivativeErrorLog({
          packageId: storedPackage.manifest.packageId,
          fileId: asset.fileId,
          fileName: asset.name,
          fileKind: asset.kind,
          stage: derivative.errorLog.stage,
          message: derivative.errorLog.message,
        });

        derivativeErrors.push(errorRecord);
      }

      zip.file(`${derivativeFolder}/${derivativeFileName}`, derivative.data);
      zip.file(
        `${derivativeFolder}/manifest-reference.json`,
        JSON.stringify(
          {
            packageId: storedPackage.manifest.packageId,
            packageTitle: storedPackage.manifest.title,
            fileId: asset.fileId,
            fileName: asset.name,
            srjKeyId: storedPackage.manifest.srjKeyReference.keyId,
            srjKeyReference: storedPackage.manifest.srjKeyReference,
            allowedUses: storedPackage.manifest.allowedUses,
            termsVersion: storedPackage.manifest.termsVersion,
            noticeText: storedPackage.manifest.noticeText,
            derivative: {
              fileName: derivativeFileName,
              contentType: derivative.contentType,
              derivativeKind: derivative.derivativeKind,
              originalBytes: input.byteLength,
              derivativeBytes: derivative.data.byteLength,
              optimizationNote: derivative.optimizationNote,
              fallbackToOriginal: derivative.derivativeKind === "passthrough",
            },
          },
          null,
          2,
        ),
      );

      derivativeEntries.push({
        fileId: asset.fileId,
        originalName: asset.name,
        derivativeName: derivativeFileName,
        derivativeKind: derivative.derivativeKind,
        originalBytes: input.byteLength,
        derivativeBytes: derivative.data.byteLength,
        optimizationNote: derivative.optimizationNote,
      });
    }

    zip.file(
      "recipient-derivatives.json",
      JSON.stringify(
        {
          packageId: storedPackage.manifest.packageId,
          srjKeyReference: storedPackage.manifest.srjKeyReference,
          generatedAt: new Date().toISOString(),
          files: derivativeEntries,
        },
        null,
        2,
      ),
    );

    zip.file(
      "derivative-errors.json",
      JSON.stringify(
        {
          packageId: storedPackage.manifest.packageId,
          generatedAt: new Date().toISOString(),
          errors: derivativeErrors,
        },
        null,
        2,
      ),
    );

    const plainTextErrorLog =
      derivativeErrors.length > 0
        ? [
            `SRJ derivative fallback log`,
            `Package ID: ${storedPackage.manifest.packageId}`,
            `Generated at: ${new Date().toISOString()}`,
            "",
            ...derivativeErrors.map((error, index) =>
              [
                `Error ${index + 1}`,
                `loggedAt: ${String(error.loggedAt ?? "")}`,
                `fileId: ${String(error.fileId ?? "")}`,
                `fileName: ${String(error.fileName ?? "")}`,
                `fileKind: ${String(error.fileKind ?? "")}`,
                `stage: ${String(error.stage ?? "")}`,
                `message: ${String(error.message ?? "")}`,
                "",
              ].join("\n"),
            ),
          ].join("\n")
        : [
            "SRJ derivative fallback log",
            `Package ID: ${storedPackage.manifest.packageId}`,
            `Generated at: ${new Date().toISOString()}`,
            "",
            "No derivative fallback errors were recorded for this ZIP.",
          ].join("\n");

    zip.file("error.log", plainTextErrorLog);

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
