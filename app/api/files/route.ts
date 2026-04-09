import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccessCookieName, getPrivateBlob, isBlobConfigured } from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get("packageId");
  const pathname = searchParams.get("pathname");

  if (!packageId || !pathname) {
    return NextResponse.json({ error: "packageId and pathname are required." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(getAccessCookieName(packageId));

  if (!accessCookie) {
    return NextResponse.json({ error: "Terms must be accepted before file access is granted." }, { status: 403 });
  }

  if (!pathname.startsWith(`srj-demo/package-files/${packageId}/`)) {
    return NextResponse.json({ error: "File path does not belong to this package." }, { status: 400 });
  }

  try {
    const blob = await getPrivateBlob(pathname);

    return new Response(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load the requested file preview." }, { status: 404 });
  }
}
