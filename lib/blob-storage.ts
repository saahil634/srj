import { del, get, list, put } from "@vercel/blob";

import { GOVERNANCE_NOTICE, TERMS_PRESET, TERMS_VERSION } from "@/lib/constants";
import {
  AcceptancePayload,
  DemoFileAsset,
  MetadataLayerLog,
  MetadataLayerType,
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
const ACCESS_KEY_FILE_PREFIX = "srj-demo/access-keys";
const METADATA_LAYER_LOG_PREFIX = "srj-demo/metadata-layer-logs";

export const BLOB_CONFIG_ERROR =
  "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN before creating packages or recording access events.";

interface CreateStoredPackageInput {
  title: string;
  termsPreset: string;
  noticeText: string;
  packageAccessKey: string;
  ownerRootKeyFileId?: string | null;
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

function buildMetadataLayerLogPath(packageId: string, metadataLayerId: string) {
  return `${METADATA_LAYER_LOG_PREFIX}/${packageId}/${metadataLayerId}.json`;
}

function buildAccessKeyFilePath(accessKeyId: string) {
  return `${ACCESS_KEY_FILE_PREFIX}/${accessKeyId}.txt`;
}

export interface StoredRootKeyRecord {
  accessKeyId: string;
  accessKey: string;
  createdAt: string;
  geoSummary: string | null;
  ownerName: string | null;
  ownerOrganization: string | null;
  ownerEmail: string | null;
  accessEventsText: string;
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

async function listPathnames(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs.map((blob) => blob.pathname);
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
  const { ownerRootKeyReference: _ownerRootKeyReference, ...publicManifest } = pkg.manifest;

  return {
    ...pkg,
    manifest: publicManifest,
    assets: pkg.assets.map((asset) => ({
      ...asset,
      previewUrl:
        asset.pathname && pkg.manifest.packageId
          ? buildPreviewUrl(pkg.manifest.packageId, asset.pathname)
          : asset.previewUrl,
    })),
  } satisfies StoredDemoPackage;
}

async function readStoredPackageRecord(packageId: string) {
  return readBlobJson<StoredDemoPackage>(buildRecordPath(packageId));
}

async function countStoredPackagesByOwnerRootKeyFileId(ownerRootKeyFileId: string) {
  const { blobs } = await list({
    prefix: `${PACKAGE_RECORD_PREFIX}/`,
  });
  let count = 0;

  for (const blob of blobs) {
    try {
      const record = await readBlobJson<StoredDemoPackage>(blob.pathname);

      if (record.manifest.ownerRootKeyReference?.accessKeyFileId === ownerRootKeyFileId) {
        count += 1;
      }
    } catch {
      // Skip malformed package records.
    }
  }

  return count;
}

export async function createStoredPackage({
  title,
  termsPreset,
  noticeText,
  packageAccessKey,
  ownerRootKeyFileId,
  files,
}: CreateStoredPackageInput) {
  ensureBlobConfigured();

  if (!ownerRootKeyFileId) {
    throw new Error("An SRJ-root key must be linked before packages can be created.");
  }

  const existingPackageCount = await countStoredPackagesByOwnerRootKeyFileId(ownerRootKeyFileId);

  if (existingPackageCount >= 3) {
    throw new Error("Only 3 SRJ packages can be created per SRJ-root key at this time.");
  }

  const packageId = generateId("srj");
  const createdAt = new Date().toISOString();
  const srjTargetValue = evaluateArithmeticExpression(packageAccessKey);

  const srjKeyId = generateId("srjak");
  const ownerRootKeyId = generateId("srjrk");

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
      relationExpression: packageAccessKey,
      targetValue: srjTargetValue,
      accessKey: packageAccessKey,
      sessionScoped: false,
    },
    ownerRootKeyReference: {
      keyId: ownerRootKeyId,
      accessKeyFileId: ownerRootKeyFileId ?? null,
      sessionScoped: true,
    },
    allowedUses: termsPreset || TERMS_PRESET,
    termsVersion: TERMS_VERSION,
    noticeText: noticeText || GOVERNANCE_NOTICE,
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

  const record = await readStoredPackageRecord(packageId);

  return record;
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

export async function getLatestStoredAcceptanceRecord(packageId: string) {
  ensureBlobConfigured();

  const { blobs } = await list({
    prefix: `${ACCEPTANCE_LOG_PREFIX}/${packageId}/`,
  });

  if (blobs.length === 0) {
    return null;
  }

  const latestBlob = blobs
    .slice()
    .sort((left, right) => right.pathname.localeCompare(left.pathname))[0];

  if (!latestBlob) {
    return null;
  }

  const log = await readBlobJson<PersistedAcceptanceLog>(latestBlob.pathname);

  return {
    fullName: log.fullName,
    email: log.email,
    organization: log.organization,
    acceptedAt: log.acceptedAt,
  };
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

export async function createStoredMetadataLayer(input: {
  packageId: string;
  fileIds: string[];
  createdBy: {
    rootKeyFileId?: string | null;
    rootKeyValue?: string | null;
    name?: string | null;
    email?: string | null;
    organization?: string | null;
    keyType: "secure-key" | "access-key";
  };
  sourceAccess?: {
    accessorRootKey?: string | null;
  };
  layerType: MetadataLayerType;
  layerTitle: string;
  language?: string | null;
  description: string;
  payload: Record<string, string | string[] | null>;
  geoSummary?: string | null;
}) {
  ensureBlobConfigured();

  const pkg = await readStoredPackageRecord(input.packageId);
  const fileIds = Array.from(new Set(input.fileIds.map((value) => value.trim()).filter(Boolean)));

  if (fileIds.length === 0) {
    throw new Error("At least one package file must be selected.");
  }

  const packageFileIds = new Set(pkg.manifest.files.map((file) => file.fileId));
  const invalidFileIds = fileIds.filter((fileId) => !packageFileIds.has(fileId));

  if (invalidFileIds.length > 0) {
    throw new Error("One or more selected files do not belong to this SRJ package.");
  }

  const metadataLayerId = generateId("srjml");
  const createdAt = new Date().toISOString();
  const linkedRootKeyFileId = pkg.manifest.ownerRootKeyReference?.accessKeyFileId ?? null;

  const metadataLayer: MetadataLayerLog = {
    metadataLayerId,
    packageId: input.packageId,
    fileIds,
    createdAt,
    linkedRootKeyFileId,
    createdBy: {
      rootKeyFileId: input.createdBy.rootKeyFileId ?? null,
      rootKeyValue: input.createdBy.rootKeyValue ?? null,
      name: input.createdBy.name ?? null,
      email: input.createdBy.email ?? null,
      organization: input.createdBy.organization ?? null,
      keyType: input.createdBy.keyType,
    },
    sourceAccess: {
      accessorRootKey: input.sourceAccess?.accessorRootKey ?? null,
    },
    layerType: input.layerType,
    layerTitle: input.layerTitle,
    language: input.language ?? null,
    description: input.description,
    payload: input.payload,
  };

  await writeJsonBlob(
    buildMetadataLayerLogPath(input.packageId, metadataLayerId),
    metadataLayer,
  );

  if (linkedRootKeyFileId) {
    await appendStoredMetadataLayerEvent({
      accessKeyId: linkedRootKeyFileId,
      packageId: input.packageId,
      metadataLayerId,
      createdAt,
      layerType: input.layerType,
      fileIds,
      contributorName: input.createdBy.name ?? null,
      contributorOrganization: input.createdBy.organization ?? null,
      contributorEmail: input.createdBy.email ?? null,
      accessorRootKey:
        input.sourceAccess?.accessorRootKey ?? input.createdBy.rootKeyValue ?? null,
      geoSummary: input.geoSummary ?? null,
    });
  }

  return metadataLayer;
}

export async function listStoredMetadataLayers(packageId: string) {
  ensureBlobConfigured();

  const { blobs } = await list({
    prefix: `${METADATA_LAYER_LOG_PREFIX}/${packageId}/`,
  });

  const layers = await Promise.all(
    blobs.map(async (blob) => readBlobJson<MetadataLayerLog>(blob.pathname)),
  );

  return layers.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function buildAccessKeyFileText(input: {
  accessKeyId: string;
  accessKey: string;
  createdAt: string;
  geoSummary?: string | null;
  ownerName?: string | null;
  ownerOrganization?: string | null;
  ownerEmail?: string | null;
  accessEventsText?: string;
}) {
  return [
    "SRJ ROOT KEY",
    `SRJ-root key file ID: ${input.accessKeyId}`,
    `SRJ-root key value: ${input.accessKey}`,
    `Created At: ${input.createdAt}`,
    `Geolocation: ${input.geoSummary || "Unavailable"}`,
    `Owner Name: ${input.ownerName || "Unlinked"}`,
    `Owner Organization: ${input.ownerOrganization || "Unlinked"}`,
    `Owner Email: ${input.ownerEmail || "Unlinked"}`,
    "",
    "SRJ ROOT KEY",
    input.accessKey,
    "",
    "ACCESS EVENTS",
    input.accessEventsText?.trim() ? input.accessEventsText.trim() : "",
  ].join("\n");
}

function isLikelyMetadataLabelLine(value: string) {
  return /^(SRJ-root key file ID|Secure Key File ID|Root Key File ID|SRJ-root key value|Created At|Geolocation|Owner Name|Owner Organization|Owner Email):/i.test(
    value,
  );
}

async function writeTextBlob(pathname: string, value: string) {
  await put(pathname, value, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain; charset=utf-8",
  });
}

export async function createStoredAccessKeyFile(input: {
  accessKey: string;
  geoSummary?: string | null;
  ownerName?: string | null;
  ownerOrganization?: string | null;
  ownerEmail?: string | null;
}) {
  ensureBlobConfigured();

  const accessKeyId = generateId("srjak");
  const createdAt = new Date().toISOString();
  const text = buildAccessKeyFileText({
    accessKeyId,
    accessKey: input.accessKey,
    createdAt,
    geoSummary: input.geoSummary ?? null,
    ownerName: input.ownerName ?? null,
    ownerOrganization: input.ownerOrganization ?? null,
    ownerEmail: input.ownerEmail ?? null,
  });

  await writeTextBlob(buildAccessKeyFilePath(accessKeyId), text);

  return {
    accessKeyId,
    createdAt,
    pathname: buildAccessKeyFilePath(accessKeyId),
    fileName: `${accessKeyId}.txt`,
  };
}

function parseStoredRootKeyRecordText(text: string): StoredRootKeyRecord {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const accessEventsIndex = lines.findIndex((line) => line.trim() === "ACCESS EVENTS");
  const rootKeyIndex = lines.findLastIndex((line, index) => {
    if (index >= accessEventsIndex && accessEventsIndex !== -1) {
      return false;
    }

    const normalized = line.trim();

    return (
      normalized === "SRJ ROOT KEY" ||
      normalized === "SECURE KEY" ||
      normalized === "ROOT KEY"
    );
  });

  if (rootKeyIndex === -1 || accessEventsIndex === -1 || rootKeyIndex + 1 >= lines.length) {
    throw new Error("Stored SRJ-root key record is malformed.");
  }

  const readValue = (label: string) => {
    const line = lines.find((entry) => entry.startsWith(`${label}:`));
    return line ? line.slice(label.length + 1).trim() : "";
  };

  const normalizeOptional = (value: string) => {
    if (!value || value === "Unavailable" || value === "Unlinked") {
      return null;
    }

    return value;
  };

  const explicitAccessKey =
    readValue("SRJ-root key value") ||
    readValue("Secure Key Value") ||
    readValue("Root Key Value");
  const blockAccessKey = lines[rootKeyIndex + 1]?.trim() ?? "";
  const accessKey = explicitAccessKey
    ? explicitAccessKey
    : isLikelyMetadataLabelLine(blockAccessKey)
      ? ""
      : blockAccessKey;

  if (!accessKey) {
    throw new Error("Stored SRJ-root key record is missing the root-key value.");
  }

  return {
    accessKeyId:
      readValue("SRJ-root key file ID") || readValue("Secure Key File ID") || readValue("Root Key File ID"),
    createdAt: readValue("Created At"),
    geoSummary: normalizeOptional(readValue("Geolocation")),
    ownerName: normalizeOptional(readValue("Owner Name")),
    ownerOrganization: normalizeOptional(readValue("Owner Organization")),
    ownerEmail: normalizeOptional(readValue("Owner Email")),
    accessKey,
    accessEventsText: lines.slice(accessEventsIndex + 1).join("\n").trim(),
  };
}

export async function getStoredRootKeyRecord(accessKeyId: string) {
  ensureBlobConfigured();

  const text = await readBlobText(buildAccessKeyFilePath(accessKeyId));
  return parseStoredRootKeyRecordText(text);
}

export async function updateStoredRootKeyProfile(input: {
  accessKeyId: string;
  ownerName?: string | null;
  ownerOrganization?: string | null;
  ownerEmail?: string | null;
}) {
  ensureBlobConfigured();

  const pathname = buildAccessKeyFilePath(input.accessKeyId);
  const currentRecord = await getStoredRootKeyRecord(input.accessKeyId);
  const nextText = buildAccessKeyFileText({
    accessKeyId: currentRecord.accessKeyId,
    accessKey: currentRecord.accessKey,
    createdAt: currentRecord.createdAt,
    geoSummary: currentRecord.geoSummary,
    ownerName: input.ownerName ?? currentRecord.ownerName,
    ownerOrganization: input.ownerOrganization ?? currentRecord.ownerOrganization,
    ownerEmail: input.ownerEmail ?? currentRecord.ownerEmail,
    accessEventsText: currentRecord.accessEventsText,
  });

  await writeTextBlob(pathname, nextText);

  return getStoredRootKeyRecord(input.accessKeyId);
}

export async function getStoredAccessKeyFile(accessKeyId: string) {
  ensureBlobConfigured();

  const pathname = buildAccessKeyFilePath(accessKeyId);
  const response = await getPrivateBlob(pathname);

  return {
    pathname,
    fileName: `${accessKeyId}.txt`,
    response,
  };
}

async function readStoredRootKeyValue(accessKeyFileId: string) {
  const record = await getStoredRootKeyRecord(accessKeyFileId);
  return record.accessKey;
}

async function verifyPackageOwnerRootKey(input: {
  packageId: string;
  rootKey: string;
  rootKeyFileId?: string | null;
}) {
  const pkg = await getStoredPackage(input.packageId);
  const ownerRootKeyReference = pkg.manifest.ownerRootKeyReference;

  if (!ownerRootKeyReference?.accessKeyFileId) {
    throw new Error("This package is not linked to an owner SRJ-root key.");
  }

  if (
    input.rootKeyFileId &&
    ownerRootKeyReference.accessKeyFileId !== input.rootKeyFileId.trim()
  ) {
    throw new Error("The SRJ-root key does not match this package owner.");
  }

  const storedRootKey = await readStoredRootKeyValue(ownerRootKeyReference.accessKeyFileId);

  if (storedRootKey !== input.rootKey.trim()) {
    throw new Error("The SRJ-root key does not match this package owner.");
  }

  return {
    pkg,
    ownerRootKeyFileId: ownerRootKeyReference.accessKeyFileId,
  };
}

export async function listStoredPackagesByOwnerRootKey(input: {
  rootKey: string;
  rootKeyFileId?: string | null;
}) {
  ensureBlobConfigured();

  const { blobs } = await list({
    prefix: `${PACKAGE_RECORD_PREFIX}/`,
  });

  const packages = await Promise.all(
    blobs.map(async (blob) => readBlobJson<StoredDemoPackage>(blob.pathname)),
  );

  const matchingPackages = await Promise.all(
    packages.map(async (pkg) => {
      try {
        const ownerRootKeyReference = pkg.manifest.ownerRootKeyReference;

        if (!ownerRootKeyReference?.accessKeyFileId) {
          return null;
        }

        if (
          input.rootKeyFileId &&
          ownerRootKeyReference.accessKeyFileId !== input.rootKeyFileId.trim()
        ) {
          return null;
        }

        const storedRootKey = await readStoredRootKeyValue(ownerRootKeyReference.accessKeyFileId);

        return storedRootKey === input.rootKey.trim() ? hydrateStoredPackage(pkg) : null;
      } catch {
        return null;
      }
    }),
  );

  return matchingPackages
    .filter((entry): entry is StoredDemoPackage => Boolean(entry))
    .sort(
      (left, right) =>
        new Date(right.manifest.createdAt).getTime() - new Date(left.manifest.createdAt).getTime(),
    );
}

export async function findStoredRootKeyRecordByValue(rootKey: string) {
  ensureBlobConfigured();

  const { blobs } = await list({
    prefix: `${ACCESS_KEY_FILE_PREFIX}/`,
  });

  for (const blob of blobs) {
    try {
      const record = await getStoredRootKeyRecord(
        blob.pathname.replace(`${ACCESS_KEY_FILE_PREFIX}/`, "").replace(/\.txt$/, ""),
      );

      if (record.accessKey === rootKey.trim()) {
        return record;
      }
    } catch {
      // Skip malformed records.
    }
  }

  return null;
}

export async function appendStoredAccessKeyAccessEvent(input: {
  accessKeyId: string;
  packageId: string;
  fullName: string;
  organization?: string;
  email: string;
  acceptedAt: string;
  accessorRootKey?: string;
  geoSummary?: string | null;
}) {
  ensureBlobConfigured();

  const currentRecord = await getStoredRootKeyRecord(input.accessKeyId);
  const eventText = [
    "---",
    `Accepted At: ${input.acceptedAt}`,
    `Package ID: ${input.packageId}`,
    `Full Name: ${input.fullName}`,
    `Organization: ${input.organization || "Unavailable"}`,
    `Email: ${input.email}`,
    `Accessor Root Key: ${input.accessorRootKey || "Unavailable"}`,
    `Geolocation: ${input.geoSummary || "Unavailable"}`,
    "",
  ].join("\n");

  const nextText = buildAccessKeyFileText({
    accessKeyId: currentRecord.accessKeyId,
    accessKey: currentRecord.accessKey,
    createdAt: currentRecord.createdAt,
    geoSummary: currentRecord.geoSummary,
    ownerName: currentRecord.ownerName,
    ownerOrganization: currentRecord.ownerOrganization,
    ownerEmail: currentRecord.ownerEmail,
    accessEventsText: currentRecord.accessEventsText
      ? `${currentRecord.accessEventsText}\n${eventText}`
      : eventText,
  });

  await writeTextBlob(buildAccessKeyFilePath(input.accessKeyId), nextText);
}

export async function appendStoredMetadataLayerEvent(input: {
  accessKeyId: string;
  packageId: string;
  metadataLayerId: string;
  createdAt: string;
  layerType: MetadataLayerType;
  fileIds: string[];
  contributorName?: string | null;
  contributorOrganization?: string | null;
  contributorEmail?: string | null;
  accessorRootKey?: string | null;
  geoSummary?: string | null;
}) {
  ensureBlobConfigured();

  const currentRecord = await getStoredRootKeyRecord(input.accessKeyId);
  const eventText = [
    "---",
    "Event Type: created_metadata_layer",
    `Created At: ${input.createdAt}`,
    `Package ID: ${input.packageId}`,
    `Metadata Layer ID: ${input.metadataLayerId}`,
    `Layer Type: ${input.layerType}`,
    `Target File IDs: ${input.fileIds.join(", ")}`,
    `Contributor Name: ${input.contributorName || "Unavailable"}`,
    `Contributor Organization: ${input.contributorOrganization || "Unavailable"}`,
    `Contributor Email: ${input.contributorEmail || "Unavailable"}`,
    `Accessor Root Key: ${input.accessorRootKey || "Unavailable"}`,
    `Geolocation: ${input.geoSummary || "Unavailable"}`,
    "",
  ].join("\n");

  const nextText = buildAccessKeyFileText({
    accessKeyId: currentRecord.accessKeyId,
    accessKey: currentRecord.accessKey,
    createdAt: currentRecord.createdAt,
    geoSummary: currentRecord.geoSummary,
    ownerName: currentRecord.ownerName,
    ownerOrganization: currentRecord.ownerOrganization,
    ownerEmail: currentRecord.ownerEmail,
    accessEventsText: currentRecord.accessEventsText
      ? `${currentRecord.accessEventsText}\n${eventText}`
      : eventText,
  });

  await writeTextBlob(buildAccessKeyFilePath(input.accessKeyId), nextText);
}

export async function deleteStoredPackage(input: {
  packageId: string;
  rootKey: string;
  rootKeyFileId?: string | null;
}) {
  ensureBlobConfigured();

  const { pkg } = await verifyPackageOwnerRootKey(input);

  const filePathnames = pkg.assets
    .map((asset) => asset.pathname)
    .filter((pathname): pathname is string => Boolean(pathname));
  const acceptancePathnames = await listPathnames(`${ACCEPTANCE_LOG_PREFIX}/${input.packageId}/`);
  const derivativeLogPathnames = await listPathnames(
    `${DERIVATIVE_ERROR_LOG_PREFIX}/${input.packageId}/`,
  );

  const pathnames = [
    buildRecordPath(input.packageId),
    ...filePathnames,
    ...acceptancePathnames,
    ...derivativeLogPathnames,
  ];

  if (pathnames.length > 0) {
    await del(pathnames);
  }
}

export async function getStoredAccessRecordFileForOwner(input: {
  packageId: string;
  rootKey: string;
  rootKeyFileId?: string | null;
}) {
  ensureBlobConfigured();

  const { pkg, ownerRootKeyFileId } = await verifyPackageOwnerRootKey(input);
  const storedFile = await getStoredAccessKeyFile(ownerRootKeyFileId);

  return {
    packageTitle: pkg.manifest.title,
    ...storedFile,
  };
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
