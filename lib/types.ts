export type DemoFileKind = "image" | "audio" | "pdf" | "video" | "text" | "other";

export interface SRJKeyReference {
  keyId: string;
  relationExpression: string;
  targetValue: number | null;
  accessKey?: string | null;
  accessKeyFileId?: string | null;
  sessionScoped: boolean;
}

export interface SRJManifestFile {
  fileId: string;
  name: string;
  type: string;
  size: number;
  kind: DemoFileKind;
  srjKeyId: string;
}

export interface SRJPackageManifest {
  packageId: string;
  title: string;
  createdAt: string;
  files: SRJManifestFile[];
  srjKeyReference: SRJKeyReference;
  allowedUses: string;
  termsVersion: string;
  noticeText: string;
}

export interface DemoFileAsset extends SRJManifestFile {
  pathname?: string;
  previewUrl: string;
}

export interface AcceptanceRecord {
  fullName: string;
  email: string;
  acceptedAt: string;
}

export interface StoredDemoPackage {
  manifest: SRJPackageManifest;
  assets: DemoFileAsset[];
  acceptance?: AcceptanceRecord;
}

export interface AcceptancePayload {
  packageId: string;
  fullName: string;
  email: string;
  accepted: boolean;
}

export interface PersistedAcceptanceLog extends AcceptancePayload {
  acceptedAt: string;
}
