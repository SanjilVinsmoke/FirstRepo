/**
 * GET /api/history
 * Returns the last 5 compression jobs for the current session.
 */
import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ history: [] });
  }
  const history = getHistory(sessionId);
  return NextResponse.json({ history });
}
