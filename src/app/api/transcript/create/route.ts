import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createFromTranscript } from "@/lib/transcript";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can create from a transcript" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const transcript = body.transcript;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
    }

    const result = await createFromTranscript(currentUser, transcript);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          issues: result.issues,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        projects: result.projects,
        totals: result.totals,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Transcript creation route error:", err);
    return NextResponse.json(
      { error: "Internal server error during transcript processing" },
      { status: 500 }
    );
  }
}
