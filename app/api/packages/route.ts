import { NextResponse } from "next/server";

import { MAX_TOTAL_UPLOAD_BYTES } from "@/lib/constants";
import {
  BLOB_CONFIG_ERROR,
  createStoredPackage,
  deleteStoredPackage,
  isBlobConfigured,
  listStoredPackages,
} from "@/lib/blob-storage";
import { isAllowedUploadFile } from "@/lib/upload-rules";

export const dynamic = "force-dynamic";

export async function GET() {
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
    const packages = await listStoredPackages();

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
    const srjRelation = String(formData.get("srjRelation") ?? "").trim();
    const accessKeyId = String(formData.get("accessKeyId") ?? "").trim() || null;
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

    if (!srjRelation) {
      return NextResponse.json(
        { error: "An SRJ relation reference is required." },
        { status: 400 },
      );
    }

    const storedPackage = await createStoredPackage({
      title,
      termsPreset,
      srjRelation,
      accessKeyId,
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
      accessKey?: string;
    };
    const packageId = String(payload.packageId ?? "").trim();
    const accessKey = String(payload.accessKey ?? "").trim();

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required." }, { status: 400 });
    }

    if (!accessKey) {
      return NextResponse.json({ error: "SRJ access key is required." }, { status: 400 });
    }

    await deleteStoredPackage({ packageId, accessKey });

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
      { status: message.includes("does not match") ? 403 : 500 },
    );
  }
}
