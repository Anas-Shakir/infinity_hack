import Link from "next/link";
import { Calendar, User, CheckCircle2, ChevronRight, Building } from "lucide-react";
import { ProjectSummary } from "@/lib/access";

export default function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative block p-6 bg-white rounded-2xl border border-[#e7e9ed] shadow-clickup-sm hover:shadow-clickup-md hover:border-[#4617a8]/35 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f8f9fb] text-[#1a1a1a]/80 border border-[#e7e9ed] mb-2.5">
            <Building className="w-3 h-3 text-[#4617a8]" />
            <span>{project.clientName}</span>
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#4617a8] transition-colors line-clamp-1">
            {project.name}
          </h3>
        </div>

        <div className="p-2 rounded-xl bg-[#f8f9fb] text-gray-400 group-hover:bg-[#4617a8]/10 group-hover:text-[#4617a8] transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {project.description && (
        <p className="mt-3 text-xs sm:text-sm text-[#1a1a1a]/70 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-[#f0f2f5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#1a1a1a]/60">
        <div className="flex items-center gap-1.5 font-semibold text-[#1a1a1a]">
          <div className="w-5 h-5 rounded-full bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center text-[10px]">
            <User className="w-3 h-3" />
          </div>
          <span>PM: {project.manager?.name || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Due {project.deadline}</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-[#4617a8] bg-[#4617a8]/10 px-2.5 py-0.5 rounded-md border border-[#4617a8]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6600]" />
            <span>{project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
