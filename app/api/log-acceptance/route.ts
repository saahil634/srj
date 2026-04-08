import { NextResponse } from "next/server";

import { getAccessCookieName, isBlobConfigured, recordAcceptanceLog, BLOB_CONFIG_ERROR } from "@/lib/blob-storage";
import { AcceptancePayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AcceptancePayload>;

  if (!isBlobConfigured()) {
    return NextResponse.json({ error: BLOB_CONFIG_ERROR }, { status: 503 });
  }

  if (!body.packageId || !body.fullName || !body.email || body.accepted !== true) {
    return NextResponse.json(
      { error: "Missing packageId, fullName, email, or acceptance flag." },
      { status: 400 },
    );
  }

  try {
    const log = await recordAcceptanceLog({
      packageId: body.packageId,
      fullName: body.fullName,
      email: body.email,
      accepted: true,
    });

    const response = NextResponse.json({
      packageId: body.packageId,
      acceptedAt: log.acceptedAt,
      governanceNotice: "Acceptance logged to persistent storage for demo purposes.",
    });

    response.cookies.set({
      name: getAccessCookieName(body.packageId),
      value: log.acceptedAt,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the terms acceptance event.",
      },
      { status: 500 },
    );
  }
}
