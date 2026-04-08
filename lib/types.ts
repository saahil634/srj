export type DemoFileKind = "image" | "pdf" | "video" | "other";

export interface SRJManifestFile {
  fileId: string;
  name: string;
  type: string;
  size: number;
  kind: DemoFileKind;
}

export interface SRJPackageManifest {
  packageId: string;
  title: string;
  createdAt: string;
  files: SRJManifestFile[];
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
