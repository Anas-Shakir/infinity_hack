"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  RotateCcw,
  Building,
  Calendar,
  Layers
} from "lucide-react";
import ErrorList from "./ErrorList";
import { ValidationIssue } from "@/lib/validation";

interface CreatedProject {
  id: string;
  name: string;
  clientName: string;
  managerId: string;
  deadline: string;
  taskCount: number;
}

interface TranscriptFormProps {
  sampleTranscript: string;
}

export default function TranscriptForm({ sampleTranscript }: TranscriptFormProps) {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [createdProjects, setCreatedProjects] = useState<CreatedProject[] | null>(null);
  const [totals, setTotals] = useState<{ projects: number; tasks: number } | null>(null);

  const handleLoadSample = () => {
    setTranscript(sampleTranscript);
    setErrorMessage(null);
    setIssues([]);
    setCreatedProjects(null);
  };

  const handleClear = () => {
    setTranscript("");
    setErrorMessage(null);
    setIssues([]);
    setCreatedProjects(null);
    setTotals(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setErrorMessage("Please enter or paste a meeting transcript first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIssues([]);
    setCreatedProjects(null);
    setTotals(null);

    try {
      const response = await fetch("/api/transcript/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to process transcript.");
        setIssues(data.issues || []);
        return;
      }

      setCreatedProjects(data.projects || []);
      setTotals(data.totals || null);
    } catch {
      setErrorMessage("Network or connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Area */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e7e9ed] p-6 sm:p-7 shadow-clickup-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="transcript" className="block text-sm font-bold text-[#1a1a1a]">
            Meeting Transcript / Notes
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] hover:bg-[#4617a8]/15 border border-[#4617a8]/25 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#4617a8]" />
              Load Sample Transcript
            </button>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-[#1a1a1a] hover:bg-[#f3f4f8] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <textarea
            id="transcript"
            rows={14}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isLoading}
            placeholder="Paste raw meeting transcript here, or click 'Load Sample Transcript' above..."
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border border-[#e7e9ed] focus:border-[#4617a8] focus:ring-2 focus:ring-[#4617a8]/20 outline-none transition-all placeholder:font-sans placeholder:text-gray-400 bg-[#f8f9fb] focus:bg-white leading-relaxed text-[#1a1a1a]"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400 font-medium">
            {transcript ? `${transcript.length.toLocaleString()} characters` : "No transcript loaded"}
          </span>

          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="genesis-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AI is reading the meeting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Create from Transcript</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error & Validation Feedback */}
      {(errorMessage || issues.length > 0) && (
        <ErrorList
          title="Could Not Process Transcript"
          error={errorMessage ?? undefined}
          issues={issues}
        />
      )}

      {/* Success View */}
      {createdProjects && createdProjects.length > 0 && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-6 shadow-clickup-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Created {totals?.projects ?? createdProjects.length} projects and {totals?.tasks ?? 0} tasks successfully!
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                All projects and task assignments were validated against the company directory and saved to the database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {createdProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white p-4 rounded-xl border border-emerald-100 shadow-clickup-sm flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1a1a1a]/60 mb-1">
                    <Building className="w-3 h-3 text-[#4617a8]" />
                    <span>{proj.clientName}</span>
                  </div>
                  <h4 className="font-bold text-[#1a1a1a] text-sm">{proj.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {proj.deadline}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                      <Layers className="w-3 h-3" />
                      {proj.taskCount} tasks
                    </span>
                  </div>
                </div>

                <Link
                  href={`/projects/${proj.id}`}
                  className="mt-4 inline-flex items-center justify-between text-xs font-bold text-[#4617a8] hover:text-[#381289] pt-2 border-t border-[#f0f2f5]"
                >
                  <span>View Project Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
