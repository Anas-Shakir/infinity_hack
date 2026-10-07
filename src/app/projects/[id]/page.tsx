import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProjectById } from "@/lib/access";
import TaskTable from "@/components/TaskTable";
import { 
  Building, 
  Calendar, 
  User, 
  ArrowLeft, 
  Layers, 
  Clock, 
  CheckCircle2 
} from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(user, params.id);

  if (!project) {
    notFound();
  }

  const totalEffort = project.tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-8">
      {/* Top back navigation */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              <Building className="w-3.5 h-3.5 text-brand-600" />
              <span>Client: {project.clientName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {project.description}
              </p>
            )}
          </div>

          {/* Key Metrics / Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-3 min-w-[220px] bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Project Manager
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.manager?.name || "Unassigned"}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Delivery Deadline
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.deadline}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Effort
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>{totalEffort} hrs ({project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {user.role === "AGENT" ? "My Assigned Tasks" : "Project Tasks & Work Items"}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {project.tasks.length}
            </span>
          </div>
          {user.role === "AGENT" && (
            <span className="text-xs text-slate-500 italic">
              Showing only tasks assigned to your agent account
            </span>
          )}
        </div>

        <TaskTable tasks={project.tasks} showAssignee={user.role !== "AGENT"} />
      </div>
    </div>
  );
}
