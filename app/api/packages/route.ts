import { NextResponse } from "next/server";

import { MAX_TOTAL_UPLOAD_BYTES } from "@/lib/constants";
import {
  BLOB_CONFIG_ERROR,
  createStoredPackage,
  deleteStoredPackage,
  isBlobConfigured,
  listStoredPackagesByOwnerRootKey,
  listStoredPackages,
} from "@/lib/blob-storage";
import { isAllowedUploadFile } from "@/lib/upload-rules";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        packages: [],
        error: BLOB_CONFIG_ERROR,
      },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode")?.trim() ?? "";
    const secureKey =
      searchParams.get("secureKey")?.trim() ?? searchParams.get("rootKey")?.trim() ?? "";
    const secureKeyFileId =
      searchParams.get("secureKeyFileId")?.trim() ??
      searchParams.get("rootKeyFileId")?.trim() ??
      "";
    const packages =
      mode === "owner"
        ? await listStoredPackagesByOwnerRootKey({
            rootKey: secureKey,
            rootKeyFileId: secureKeyFileId || null,
          })
        : await listStoredPackages();

    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json(
      {
        packages: [],
        error:
          error instanceof Error
            ? error.message
            : "Unable to load SRJ packages from Blob storage.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const termsPreset = String(formData.get("termsPreset") ?? "").trim();
    const packageAccessKey = String(formData.get("packageAccessKey") ?? "").trim();
    const ownerRootKeyFileId =
      String(formData.get("ownerSecureKeyFileId") ?? formData.get("ownerRootKeyFileId") ?? "").trim() || null;
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!title) {
      return NextResponse.json({ error: "Package title is required." }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
    }

    if (!files.every((file) => isAllowedUploadFile(file))) {
      return NextResponse.json(
        {
          error:
            "Only images, short audio clips, short video clips, PDFs, and TXT files are allowed.",
        },
        { status: 400 },
      );
    }

    const totalBytes = files.reduce((total, file) => total + file.size, 0);

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Total upload size must stay within 10 MB." },
        { status: 400 },
      );
    }

    if (!packageAccessKey) {
      return NextResponse.json(
        { error: "An SRJ access key is required." },
        { status: 400 },
      );
    }

    const storedPackage = await createStoredPackage({
      title,
      termsPreset,
      packageAccessKey,
      ownerRootKeyFileId,
      files,
    });

    return NextResponse.json({ package: storedPackage });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the SRJ package in Blob storage.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      packageId?: string;
      secureKey?: string;
      secureKeyFileId?: string;
      rootKey?: string;
      rootKeyFileId?: string;
    };
    const packageId = String(payload.packageId ?? "").trim();
    const secureKey = String(payload.secureKey ?? payload.rootKey ?? "").trim();
    const secureKeyFileId =
      String(payload.secureKeyFileId ?? payload.rootKeyFileId ?? "").trim() || null;

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required." }, { status: 400 });
    }

    if (!secureKey) {
      return NextResponse.json({ error: "SRJ secure-key is required." }, { status: 400 });
    }

    await deleteStoredPackage({ packageId, rootKey: secureKey, rootKeyFileId: secureKeyFileId });

    return NextResponse.json({ packageId });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete the SRJ package from Blob storage.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: message.includes("secure-key") || message.includes("root key") || message.includes("does not match") ? 403 : 500 },
    );
  }
}
