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
    } catch (err) {
      setErrorMessage("Network or connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Area */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="transcript" className="block text-sm font-bold text-slate-800">
            Meeting Transcript / Notes
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Sample Transcript
            </button>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="w-full font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 outline-none transition-all placeholder:font-sans placeholder:text-slate-400 bg-slate-50/50 focus:bg-white leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {transcript ? `${transcript.length} characters` : "No transcript loaded"}
          </span>

          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is reading the meeting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
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
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-6 shadow-sm animate-in fade-in duration-300 space-y-5">
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
                className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{proj.clientName}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{proj.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {proj.deadline}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Layers className="w-3 h-3" />
                      {proj.taskCount} tasks
                    </span>
                  </div>
                </div>

                <Link
                  href={`/projects/${proj.id}`}
                  className="mt-4 inline-flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2 border-t border-slate-100"
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
