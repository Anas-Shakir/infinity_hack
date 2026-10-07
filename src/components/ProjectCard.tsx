import Link from "next/link";
import { Calendar, User, CheckCircle2, ChevronRight, Building } from "lucide-react";
import { ProjectSummary } from "@/lib/access";

export default function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative block p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 mb-2">
            <Building className="w-3 h-3 text-slate-500" />
            <span>{project.clientName}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
            {project.name}
          </h3>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {project.description && (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>PM: {project.manager?.name || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due {project.deadline}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
