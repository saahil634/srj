import { MAX_TOTAL_UPLOAD_BYTES } from "@/lib/constants";

const acceptedMimeTypes = new Set([
  "application/pdf",
  "text/plain",
]);

const acceptedExtensions = new Set([".pdf", ".txt"]);

export function isAllowedUploadFile(file: File | { type: string; name?: string }) {
  if (file.type.startsWith("image/")) {
    return true;
  }

  if (file.type.startsWith("audio/")) {
    return true;
  }

  if (file.type.startsWith("video/")) {
    return true;
  }

  if (acceptedMimeTypes.has(file.type)) {
    return true;
  }

  const lowerName = file.name?.toLowerCase() ?? "";

  return Array.from(acceptedExtensions).some((extension) => lowerName.endsWith(extension));
}

export function getTotalUploadBytes(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0);
}

export function exceedsUploadLimit(files: File[]) {
  return getTotalUploadBytes(files) > MAX_TOTAL_UPLOAD_BYTES;
}
