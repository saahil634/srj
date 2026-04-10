import { NextResponse } from "next/server";

import {
  BLOB_CONFIG_ERROR,
  findStoredRootKeyRecordByValue,
  isBlobConfigured,
  listStoredPackagesByOwnerRootKey,
} from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as { invitationCode?: string };
    const invitationCode = String(payload.invitationCode ?? "").trim();

    if (!invitationCode) {
      return NextResponse.json({ error: "Invitation code is required." }, { status: 400 });
    }

    const rootKeyRecord = await findStoredRootKeyRecordByValue(invitationCode);

    if (!rootKeyRecord) {
      return NextResponse.json({ error: "Invitation code not found." }, { status: 404 });
    }

    const packages = await listStoredPackagesByOwnerRootKey({
      rootKey: rootKeyRecord.accessKey,
      rootKeyFileId: rootKeyRecord.accessKeyId,
    });

    return NextResponse.json({
      rootKeyRecord: {
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
            : "Unable to look up the invitation code.",
      },
      { status: 500 },
    );
  }
}
