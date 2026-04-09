import { get, list, put } from "@vercel/blob";

import { GOVERNANCE_NOTICE, TERMS_PRESET, TERMS_VERSION } from "@/lib/constants";
import {
  AcceptancePayload,
  DemoFileAsset,
  PersistedAcceptanceLog,
  SRJPackageManifest,
  StoredDemoPackage,
} from "@/lib/types";
import { generateId, getFileKind } from "@/lib/utils";
import { evaluateArithmeticExpression } from "@/lib/platform-access";

const PACKAGE_RECORD_PREFIX = "srj-demo/package-records";
const PACKAGE_FILE_PREFIX = "srj-demo/package-files";
const ACCEPTANCE_LOG_PREFIX = "srj-demo/acceptance-logs";
const DERIVATIVE_ERROR_LOG_PREFIX = "srj-demo/derivative-error-logs";

export const BLOB_CONFIG_ERROR =
  "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN before creating packages or recording access events.";

interface CreateStoredPackageInput {
  title: string;
  termsPreset: string;
  srjRelation: string;
  files: File[];
}

function ensureBlobConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(BLOB_CONFIG_ERROR);
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function buildRecordPath(packageId: string) {
  return `${PACKAGE_RECORD_PREFIX}/${packageId}.json`;
}

function buildAcceptanceLogPath(packageId: string, acceptedAt: string) {
  return `${ACCEPTANCE_LOG_PREFIX}/${packageId}/${acceptedAt}.json`;
}

function buildDerivativeErrorLogPath(packageId: string, loggedAt: string, fileId: string) {
  return `${DERIVATIVE_ERROR_LOG_PREFIX}/${packageId}/${loggedAt}-${fileId}.json`;
}

export function buildPreviewUrl(packageId: string, pathname: string) {
  const params = new URLSearchParams({
    packageId,
    pathname,
  });

  return `/api/files?${params.toString()}`;
}

export function getAccessCookieName(packageId: string) {
  return `srj_access_${packageId}`;
}

async function readBlobText(pathname: string) {
  const response = await getPrivateBlob(pathname);

  return new Response(response.stream).text();
}

async function readBlobJson<T>(pathname: string) {
  const text = await readBlobText(pathname);
  return JSON.parse(text) as T;
}

async function writeJsonBlob(pathname: string, value: unknown) {
  await put(pathname, JSON.stringify(value, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}

export async function getPrivateBlob(pathname: string) {
  ensureBlobConfigured();

  const response = await get(pathname, {
    access: "private",
    useCache: false,
  });

  if (!response || response.statusCode !== 200) {
    throw new Error(`Blob not found: ${pathname}`);
  }

  return response;
}

function hydrateStoredPackage(pkg: StoredDemoPackage) {
  return {
    ...pkg,
    assets: pkg.assets.map((asset) => ({
      ...asset,
      previewUrl:
        asset.pathname && pkg.manifest.packageId
          ? buildPreviewUrl(pkg.manifest.packageId, asset.pathname)
          : asset.previewUrl,
    })),
  } satisfies StoredDemoPackage;
}

export async function createStoredPackage({
  title,
  termsPreset,
  srjRelation,
  files,
}: CreateStoredPackageInput) {
  ensureBlobConfigured();

  const packageId = generateId("srj");
  const createdAt = new Date().toISOString();
  const srjTargetValue = evaluateArithmeticExpression(srjRelation);

  if (srjTargetValue === null) {
    throw new Error("The SRJ relation reference must be a valid arithmetic expression.");
  }

  const srjKeyId = generateId("srjk");

  const assets: DemoFileAsset[] = [];

  for (const file of files) {
    const fileId = generateId("file");
    const pathname = `${PACKAGE_FILE_PREFIX}/${packageId}/${fileId}-${sanitizeFileName(file.name)}`;
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });

    assets.push({
      fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      kind: getFileKind(file),
      srjKeyId,
      pathname: blob.pathname,
      previewUrl: buildPreviewUrl(packageId, blob.pathname),
    });
  }

  const manifest: SRJPackageManifest = {
    packageId,
    title,
    createdAt,
    files: assets.map(({ previewUrl: _previewUrl, pathname: _pathname, ...file }) => file),
    srjKeyReference: {
      keyId: srjKeyId,
      relationExpression: srjRelation,
      targetValue: srjTargetValue,
      sessionScoped: true,
    },
    allowedUses: termsPreset || TERMS_PRESET,
    termsVersion: TERMS_VERSION,
    noticeText: GOVERNANCE_NOTICE,
  };

  const nextPackage: StoredDemoPackage = {
    manifest,
    assets,
  };

  await writeJsonBlob(buildRecordPath(packageId), nextPackage);

  return nextPackage;
}

export async function listStoredPackages() {
  ensureBlobConfigured();

  const { blobs } = await list({
    prefix: `${PACKAGE_RECORD_PREFIX}/`,
  });

  const packages = await Promise.all(
    blobs.map(async (blob) => {
      const record = await readBlobJson<StoredDemoPackage>(blob.pathname);
      return hydrateStoredPackage(record);
    }),
  );

  return packages.sort(
    (left, right) =>
      new Date(right.manifest.createdAt).getTime() - new Date(left.manifest.createdAt).getTime(),
  );
}

export async function getStoredPackage(packageId: string) {
  ensureBlobConfigured();

  const record = await readBlobJson<StoredDemoPackage>(buildRecordPath(packageId));

  return hydrateStoredPackage(record);
}

export async function recordAcceptanceLog(input: AcceptancePayload) {
  ensureBlobConfigured();

  const acceptedAt = new Date().toISOString();
  const log: PersistedAcceptanceLog = {
    ...input,
    acceptedAt,
  };

  await writeJsonBlob(buildAcceptanceLogPath(input.packageId, acceptedAt), log);

  return log;
}

export async function recordDerivativeErrorLog(input: {
  packageId: string;
  fileId: string;
  fileName: string;
  fileKind: string;
  stage: string;
  message: string;
}) {
  ensureBlobConfigured();

  const loggedAt = new Date().toISOString();
  const log = {
    ...input,
    loggedAt,
  };

  await writeJsonBlob(
    buildDerivativeErrorLogPath(input.packageId, loggedAt, input.fileId),
    log,
  );

  return log;
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
