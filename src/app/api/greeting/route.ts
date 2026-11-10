import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * A greeting with the time it was made, so two runs of the clip differ
 * unless the response is replayed: the stand-in for a staging database
 * whose data changes under a clip.
 */
export function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") ?? "there";
  return NextResponse.json({
    message: `Hello, ${name}!`,
    at: new Date().toISOString(),
  });
}
