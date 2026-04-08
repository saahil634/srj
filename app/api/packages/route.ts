import { NextResponse } from "next/server";

import { BLOB_CONFIG_ERROR, createStoredPackage, isBlobConfigured, listStoredPackages } from "@/lib/blob-storage";

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
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!title) {
      return NextResponse.json({ error: "Package title is required." }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
    }

    const storedPackage = await createStoredPackage({
      title,
      termsPreset,
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
