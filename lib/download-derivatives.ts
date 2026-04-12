import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

import ffmpegPath from "ffmpeg-static";
import { PDFDocument, PDFName } from "pdf-lib";
import sharp from "sharp";

import { DemoFileAsset, SRJPackageManifest } from "@/lib/types";

export interface DerivativeResult {
  data: Uint8Array;
  contentType: string;
  derivativeExtension: string;
  derivativeKind: "image" | "audio" | "pdf" | "video" | "text" | "passthrough";
  optimizationNote: string;
  errorLog?: {
    stage: string;
    message: string;
  };
}

export interface EmbeddedFileManifest {
  packageId: string;
  packageTitle: string;
  fileId: string;
  fileName: string;
  fileKind: DemoFileAsset["kind"];
  srjKeyId: string;
  srjRelation: string;
  allowedUses: string;
  termsVersion: string;
  noticeText: string;
}

function sanitizeName(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "-");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildEmbeddedFileManifest(
  manifest: SRJPackageManifest,
  asset: DemoFileAsset,
): EmbeddedFileManifest {
  return {
    packageId: manifest.packageId,
    packageTitle: manifest.title,
    fileId: asset.fileId,
    fileName: asset.name,
    fileKind: asset.kind,
    srjKeyId: manifest.srjKeyReference.keyId,
    srjRelation: manifest.srjKeyReference.relationExpression,
    allowedUses: manifest.allowedUses,
    termsVersion: manifest.termsVersion,
    noticeText: manifest.noticeText,
  };
}

function serializeEmbeddedManifest(manifest: EmbeddedFileManifest) {
  return JSON.stringify(manifest);
}

function buildEmbeddedManifestXmp(manifest: EmbeddedFileManifest) {
  const manifestJson = escapeXml(JSON.stringify(manifest));

  return [
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '    <rdf:Description rdf:about="" xmlns:srj="https://srj.pubpub.org/ns/1.0/">',
    `      <srj:manifest>${manifestJson}</srj:manifest>`,
    "    </rdf:Description>",
    "  </rdf:RDF>",
    "</x:xmpmeta>",
  ].join("\n");
}

function buildPdfManifestXmp(manifest: EmbeddedFileManifest) {
  return [
    '<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '    <rdf:Description rdf:about="" xmlns:srj="https://srj.pubpub.org/ns/1.0/">',
    `      <srj:manifest>${escapeXml(JSON.stringify(manifest))}</srj:manifest>`,
    `      <srj:packageId>${escapeXml(manifest.packageId)}</srj:packageId>`,
    `      <srj:fileId>${escapeXml(manifest.fileId)}</srj:fileId>`,
    `      <srj:srjKeyId>${escapeXml(manifest.srjKeyId)}</srj:srjKeyId>`,
    "    </rdf:Description>",
    "  </rdf:RDF>",
    "</x:xmpmeta>",
    '<?xpacket end="w"?>',
  ].join("\n");
}

function spawnProcess(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "ignore",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Process exited with code ${code}`));
    });
  });
}

async function createImageDerivative(
  buffer: Uint8Array,
  embeddedManifest?: EmbeddedFileManifest,
): Promise<DerivativeResult> {
  let pipeline = sharp(buffer, { animated: true })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (embeddedManifest) {
    pipeline = pipeline.withXmp(buildEmbeddedManifestXmp(embeddedManifest));
  }

  const output = await pipeline
    .webp({
      quality: 78,
      effort: 4,
    })
    .toBuffer();

  return {
    data: new Uint8Array(output),
    contentType: "image/webp",
    derivativeExtension: ".webp",
    derivativeKind: "image",
    optimizationNote: "Converted to WebP and resized for faster web delivery.",
  } satisfies DerivativeResult;
}

function createPassthroughDerivative(
  buffer: Uint8Array,
  asset: DemoFileAsset,
  note: string,
  errorLog?: {
    stage: string;
    message: string;
  },
) {
  return {
    data: buffer,
    contentType: asset.type || "application/octet-stream",
    derivativeExtension: extname(asset.name) || ".bin",
    derivativeKind: "passthrough",
    optimizationNote: note,
    errorLog,
  } satisfies DerivativeResult;
}

async function createPdfDerivative(
  buffer: Uint8Array,
  manifest: SRJPackageManifest,
  asset: DemoFileAsset,
  embeddedManifest?: EmbeddedFileManifest,
): Promise<DerivativeResult> {
  const pdfDoc = await PDFDocument.load(buffer);

  pdfDoc.setTitle(`${manifest.title} - web derivative`);
  pdfDoc.setProducer("SRJ Demo derivative pipeline");
  pdfDoc.setCreator("SRJ Demo");

  if (embeddedManifest) {
    const metadataStream = pdfDoc.context.flateStream(buildPdfManifestXmp(embeddedManifest), {
      Type: "Metadata",
      Subtype: "XML",
    });
    const metadataRef = pdfDoc.context.register(metadataStream);

    pdfDoc.catalog.set(PDFName.of("Metadata"), metadataRef);
  }

  const output = await pdfDoc.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });

  return {
    data: output,
    contentType: "application/pdf",
    derivativeExtension: ".pdf",
    derivativeKind: "pdf",
    optimizationNote: "Normalized PDF with embedded SRJ manifest metadata for web delivery.",
  } satisfies DerivativeResult;
}

async function createVideoDerivative(
  buffer: Uint8Array,
  asset: DemoFileAsset,
  embeddedManifest?: EmbeddedFileManifest,
): Promise<DerivativeResult> {
  if (!ffmpegPath) {
    return {
      data: buffer,
      contentType: asset.type || "video/mp4",
      derivativeExtension: extname(asset.name) || ".mp4",
      derivativeKind: "passthrough",
      optimizationNote:
        "Video transcoding fallback used because ffmpeg was unavailable at runtime.",
    } satisfies DerivativeResult;
  }

  const tempDir = await mkdtemp(join(tmpdir(), "srj-video-"));
  const inputPath = join(tempDir, `input${extname(asset.name) || ".mp4"}`);
  const outputPath = join(tempDir, "output.mp4");

  try {
    await writeFile(inputPath, buffer);
    const manifestComment = embeddedManifest ? serializeEmbeddedManifest(embeddedManifest) : null;
    await spawnProcess(ffmpegPath, [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart+use_metadata_tags",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      ...(manifestComment
        ? [
            "-metadata",
            `srj_manifest=${manifestComment}`,
          ]
        : []),
      outputPath,
    ]);

    const output = await readFile(outputPath);

    return {
      data: new Uint8Array(output),
      contentType: "video/mp4",
      derivativeExtension: ".mp4",
      derivativeKind: "video",
      optimizationNote:
        "Transcoded to H.264/AAC MP4 with reduced dimensions and fast-start for web playback.",
    } satisfies DerivativeResult;
  } catch {
    return {
      data: buffer,
      contentType: asset.type || "video/mp4",
      derivativeExtension: extname(asset.name) || ".mp4",
      derivativeKind: "passthrough",
      optimizationNote:
        "Video transcoding fallback used because the derivative pipeline could not transcode this file.",
    } satisfies DerivativeResult;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function createAudioDerivative(
  buffer: Uint8Array,
  asset: DemoFileAsset,
  embeddedManifest?: EmbeddedFileManifest,
): Promise<DerivativeResult> {
  if (!ffmpegPath) {
    return {
      data: buffer,
      contentType: asset.type || "audio/mpeg",
      derivativeExtension: ".mp3",
      derivativeKind: "passthrough",
      optimizationNote:
        "Audio transcoding fallback used because ffmpeg was unavailable at runtime.",
    } satisfies DerivativeResult;
  }

  const tempDir = await mkdtemp(join(tmpdir(), "srj-audio-"));
  const inputPath = join(tempDir, `input${extname(asset.name) || ".wav"}`);
  const outputPath = join(tempDir, "output.mp3");

  try {
    await writeFile(inputPath, buffer);
    const manifestComment = embeddedManifest ? serializeEmbeddedManifest(embeddedManifest) : null;
    await spawnProcess(ffmpegPath, [
      "-y",
      "-i",
      inputPath,
      "-write_id3v1",
      "0",
      "-id3v2_version",
      "3",
      "-vn",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      ...(manifestComment
        ? [
            "-metadata",
            `srj_manifest=${manifestComment}`,
          ]
        : []),
      outputPath,
    ]);

    const output = await readFile(outputPath);

    return {
      data: new Uint8Array(output),
      contentType: "audio/mpeg",
      derivativeExtension: ".mp3",
      derivativeKind: "audio",
      optimizationNote:
        "Transcoded to MP3 at 128 kbps for lighter web-ready audio delivery.",
    } satisfies DerivativeResult;
  } catch {
    return {
      data: buffer,
      contentType: asset.type || "audio/mpeg",
      derivativeExtension: extname(asset.name) || ".mp3",
      derivativeKind: "passthrough",
      optimizationNote:
        "Audio transcoding fallback used because the derivative pipeline could not transcode this clip.",
    } satisfies DerivativeResult;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function createTextDerivative(
  buffer: Uint8Array,
  manifest: SRJPackageManifest,
  asset: DemoFileAsset,
  embeddedManifest?: EmbeddedFileManifest,
): DerivativeResult {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const encoder = new TextEncoder();
  const sourceText = decoder.decode(buffer).replace(/\r\n/g, "\n");
  const header = [
    "SRJ DERIVATIVE DOCUMENT",
    ...(embeddedManifest
      ? ["Embedded SRJ manifest:", serializeEmbeddedManifest(embeddedManifest)]
      : [
          `Package ID: ${manifest.packageId}`,
          `Package Title: ${manifest.title}`,
          `File ID: ${asset.fileId}`,
          `SRJ Key ID: ${manifest.srjKeyReference.keyId}`,
          `SRJ Relation: ${manifest.srjKeyReference.relationExpression}`,
          `Allowed Uses: ${manifest.allowedUses}`,
          `Terms Version: ${manifest.termsVersion}`,
        ]),
    "",
    "--- DERIVATIVE CONTENT BELOW ---",
    "",
  ].join("\n");
  const output = encoder.encode(`${header}${sourceText}`);

  return {
    data: output,
    contentType: "text/plain; charset=utf-8",
    derivativeExtension: ".txt",
    derivativeKind: "text",
    optimizationNote:
      "Normalized UTF-8 text derivative with embedded SRJ manifest header for web delivery.",
  } satisfies DerivativeResult;
}

export async function createDerivativeFile(
  buffer: Uint8Array,
  manifest: SRJPackageManifest,
  asset: DemoFileAsset,
  options?: {
    embedManifest?: boolean;
  },
): Promise<DerivativeResult> {
  const embeddedManifest =
    options?.embedManifest === true ? buildEmbeddedFileManifest(manifest, asset) : undefined;

  try {
    if (asset.kind === "image") {
      return await createImageDerivative(buffer, embeddedManifest);
    }

    if (asset.kind === "pdf") {
      return await createPdfDerivative(buffer, manifest, asset, embeddedManifest);
    }

    if (asset.kind === "audio") {
      return await createAudioDerivative(buffer, asset, embeddedManifest);
    }

    if (asset.kind === "video") {
      return await createVideoDerivative(buffer, asset, embeddedManifest);
    }

    if (asset.kind === "text") {
      return createTextDerivative(buffer, manifest, asset, embeddedManifest);
    }
  } catch (error) {
    return createPassthroughDerivative(
      buffer,
      asset,
      "Derivative generation failed for this file, so the original was included unchanged for safe delivery.",
      {
        stage: `preprocess:${asset.kind}`,
        message: error instanceof Error ? error.message : "Unknown derivative generation error.",
      },
    );
  }

  return createPassthroughDerivative(
    buffer,
    asset,
    "Unsupported file type passed through without transformation.",
  );
}

export function buildDerivativePackageEntryName(asset: DemoFileAsset, extension: string) {
  const originalBase = basename(asset.name, extname(asset.name));

  return `${asset.fileId}-${sanitizeName(originalBase)}-web${extension}`;
}
