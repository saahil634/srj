"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

import { cn, formatBytes } from "@/lib/utils";

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ACCEPTED_TYPES = ["image/*", "application/pdf", "video/*"].join(",");

export function FileDropzone({ files, onFilesChange }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function mergeFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const incoming = Array.from(fileList).filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type.startsWith("video/"),
    );

    const deduped = [...files];

    incoming.forEach((file) => {
      const exists = deduped.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );

      if (!exists) {
        deduped.push(file);
      }
    });

    onFilesChange(deduped);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    mergeFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    mergeFiles(event.target.files);
    event.target.value = "";
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed px-6 py-14 text-center transition",
          isDragging
            ? "border-signal bg-teal-50"
            : "border-slate-300 bg-white hover:border-signal hover:bg-mist",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.5]">
            <path d="M12 16V4m0 0-4 4m4-4 4 4M5 15.5v2A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-2" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-ink">Drop assets to assemble the SRJ package</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
          Upload multiple images, PDFs, and short videos. The demo keeps files in local state and
          generates a manifest immediately for presentation flow-through.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal"
        >
          Select files
        </button>
      </label>

      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${file.size}`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-ink">{file.name}</p>
              <p className="text-sm text-slate">
                {file.type || "Unknown type"} • {formatBytes(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate transition hover:border-red-300 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
