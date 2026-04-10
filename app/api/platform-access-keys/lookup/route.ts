import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  findStoredRootKeyRecordByValue,
  isBlobConfigured,
  listStoredPackages,
  listStoredPackagesByOwnerRootKey,
} from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as {
      keyType?: "secure-key" | "access-key";
      keyValue?: string;
      invitationCode?: string;
    };
    const keyType = payload.keyType === "access-key" ? "access-key" : "secure-key";
    const keyValue = String(payload.keyValue ?? payload.invitationCode ?? "").trim();

    if (!keyValue) {
      return NextResponse.json({ error: "A key is required." }, { status: 400 });
    }

    if (keyType === "access-key") {
      const packages = (await listStoredPackages()).filter((entry) => {
        const reference = entry.manifest.srjKeyReference;

        return (
          reference.accessKey === keyValue ||
          reference.relationExpression === keyValue ||
          reference.keyId === keyValue
        );
      });

      if (packages.length === 0) {
        return NextResponse.json({ error: "Access-key not found." }, { status: 404 });
      }

      return NextResponse.json({
        keyType,
        packages,
      });
    }

    const rootKeyRecord = await findStoredRootKeyRecordByValue(keyValue);

    if (!rootKeyRecord) {
      return NextResponse.json({ error: "Secure-key not found." }, { status: 404 });
    }

    const packages = await listStoredPackagesByOwnerRootKey({
      rootKey: rootKeyRecord.accessKey,
      rootKeyFileId: rootKeyRecord.accessKeyId,
    });

    return NextResponse.json({
      keyType,
      secureKeyRecord: {
        accessKeyId: rootKeyRecord.accessKeyId,
        accessKey: rootKeyRecord.accessKey,
        createdAt: rootKeyRecord.createdAt,
        ownerName: rootKeyRecord.ownerName,
        ownerEmail: rootKeyRecord.ownerEmail,
      },
      packages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to look up the key.",
      },
      { status: 500 },
    );
  }
}
