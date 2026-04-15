export type DemoFileKind = "image" | "audio" | "pdf" | "video" | "text" | "other";
export type MetadataLayerType =
  | "translation"
  | "annotation"
  | "summary"
  | "context-note"
  | "rights-note"
  | "cultural-sensitivity-note"
  | "educational-note"
  | "transcription"
  | "other";

export interface SRJKeyReference {
  keyId: string;
  relationExpression: string;
  targetValue: number | null;
  accessKey?: string | null;
  sessionScoped: boolean;
}

export interface SRJRootKeyReference {
  keyId: string;
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
  ownerRootKeyReference?: SRJRootKeyReference;
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
  organization?: string;
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
  organization?: string;
  accepted: boolean;
  accessorRootKey?: string;
}

export interface PersistedAcceptanceLog extends AcceptancePayload {
  acceptedAt: string;
}

export interface MetadataLayerLog {
  metadataLayerId: string;
  packageId: string;
  fileIds: string[];
  createdAt: string;
  linkedRootKeyFileId: string | null;
  createdBy: {
    rootKeyFileId: string | null;
    rootKeyValue?: string | null;
    name?: string | null;
    email?: string | null;
    organization?: string | null;
    keyType: "secure-key" | "access-key";
  };
  sourceAccess: {
    accessorRootKey?: string | null;
  };
  layerType: MetadataLayerType;
  layerTitle: string;
  language?: string | null;
  description: string;
  payload: Record<string, string | string[] | null>;
}
