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
  Clock 
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#4617a8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-3xl border border-[#e7e9ed] p-6 sm:p-8 shadow-clickup-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/20">
              <Building className="w-3.5 h-3.5 text-[#4617a8]" />
              <span>Client: {project.clientName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs sm:text-sm text-[#1a1a1a]/70 leading-relaxed bg-[#f8f9fb] p-4 rounded-2xl border border-[#e7e9ed]">
                {project.description}
              </p>
            )}
          </div>

          {/* Key Metrics / Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-3 min-w-[220px] bg-[#f8f9fb] p-4 rounded-2xl border border-[#e7e9ed]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Project Manager
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a] mt-0.5">
                <div className="w-5 h-5 rounded-full bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center text-[10px]">
                  <User className="w-3 h-3" />
                </div>
                <span>{project.manager?.name || "Unassigned"}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Delivery Deadline
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a] mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{project.deadline}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Effort
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4617a8] mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#ff6600]" />
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
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              {user.role === "AGENT" ? "My Assigned Tasks" : "Project Tasks & Work Items"}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/20">
              {project.tasks.length}
            </span>
          </div>
          {user.role === "AGENT" && (
            <span className="text-xs text-gray-500 italic">
              Showing only tasks assigned to your agent account
            </span>
          )}
        </div>

        <TaskTable tasks={project.tasks} showAssignee={user.role !== "AGENT"} />
      </div>
    </div>
  );
}
