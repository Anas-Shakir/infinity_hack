import { XCircle } from "lucide-react";
import { ValidationIssue } from "@/lib/validation";

interface ErrorListProps {
  title?: string;
  error?: string;
  issues?: ValidationIssue[];
}

export default function ErrorList({
  title = "Validation Issues Detected",
  error,
  issues = [],
}: ErrorListProps) {
  if (!error && issues.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 text-red-900 shadow-clickup-sm animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-red-950">{title}</h4>
          {error && <p className="text-xs sm:text-sm text-red-800">{error}</p>}

          {issues.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-xs text-red-900 list-disc list-inside bg-white/80 p-3.5 rounded-xl border border-red-200/60">
              {issues.map((issue, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-mono font-bold text-red-950">[{issue.path}]</span>:{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
