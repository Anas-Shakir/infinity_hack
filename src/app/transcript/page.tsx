import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import TranscriptForm from "@/components/TranscriptForm";
import { Sparkles, ShieldCheck, Info } from "lucide-react";

export default async function TranscriptPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Strict role enforcement: Only ADMIN can access transcript conversion
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  // Read sample transcript from data/sample-transcript.txt
  let sampleTranscript = "";
  try {
    const filePath = path.join(process.cwd(), "data", "sample-transcript.txt");
    if (fs.existsSync(filePath)) {
      sampleTranscript = fs.readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.error("Error reading sample transcript file:", err);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#e7e9ed]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4617a8] bg-[#4617a8]/10 border border-[#4617a8]/25 px-3 py-1 rounded-full w-fit mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4617a8]" />
          <span>Admin Exclusive Automation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-[#4617a8]" />
          <span>Create Projects from Meeting Transcript</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1.5 leading-relaxed">
          Paste the raw meeting transcript below. The Groq AI engine will parse decisions, filter out scope exclusions, assign active team members from the employee directory, and validate all deadlines.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3.5 p-4 sm:p-5 bg-[#4617a8]/5 border border-[#4617a8]/20 rounded-2xl text-xs text-[#1a1a1a]">
        <Info className="w-4 h-4 text-[#4617a8] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#1a1a1a]">Automated Validation & Atomic Storage</p>
          <p className="text-[#1a1a1a]/70 leading-relaxed">
            The AI output is strictly validated against business rules (valid employee IDs, manager & agent roles, deadlines, effort estimates). If any discrepancy or unknown entity is found, nothing is saved and a clear error report is displayed.
          </p>
        </div>
      </div>

      {/* Transcript Submission Form */}
      <TranscriptForm sampleTranscript={sampleTranscript} />
    </div>
  );
}
