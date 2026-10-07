import { NextResponse } from "next/server";
import { extractTranscript } from "@/lib/transcript";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { transcript?: string };
    const result = await extractTranscript(body.transcript ?? "");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process transcript.";
    const status = message.includes("Paste a meeting transcript") ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
