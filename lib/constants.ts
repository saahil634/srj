import { demoCopy } from "@/lib/copy";

export const TERMS_PRESET = demoCopy.createForm.defaultTermsPreset;

export const TERMS_VERSION = "2026.04-demo";

export const GOVERNANCE_NOTICE = demoCopy.openExperience.governanceNotice.body;

export const STORAGE_KEY = "srj-demo-packages";

export const PLATFORM_ACCESS_STORAGE_KEY = "srj-platform-access";

export const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

export const UPLOAD_ACCEPT_LABEL = demoCopy.fileDropzone.allowedLabel;

export const PLATFORM_ACCESS_TERMS = [...demoCopy.platformAccess.terms];
