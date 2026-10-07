import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMyTasks, TaskDetail } from "@/lib/access";
import TaskTable from "@/components/TaskTable";
import { CheckSquare, Building, Calendar, User, ArrowRight, AlertCircle, Clock } from "lucide-react";

export default async function MyTasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "AGENT") {
    redirect("/projects");
  }

  const tasks = await getMyTasks(user);

  // Group tasks by project
  const projectMap = new Map<
    string,
    {
      projectId: string;
      projectName: string;
      clientName: string;
      managerName: string;
      projectDeadline: string;
      tasks: TaskDetail[];
    }
  >();

  tasks.forEach((t) => {
    const pId = t.projectId;
    if (!projectMap.has(pId)) {
      projectMap.set(pId, {
        projectId: pId,
        projectName: t.project?.name || "Unknown Project",
        clientName: t.project?.clientName || "Unknown Client",
        managerName: t.project?.manager?.name || "Unassigned",
        projectDeadline: t.project?.deadline || "",
        tasks: [],
      });
    }
    projectMap.get(pId)!.tasks.push(t);
  });

  const groupedProjects = Array.from(projectMap.values());
  const totalEffort = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ed]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#4617a8]" />
            </div>
            <span>My Assigned Tasks</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1">
            Personal task list for <span className="font-bold text-[#4617a8]">{user.name}</span> across all assigned client engagements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#ff6600]/10 border border-[#ff6600]/25 text-[#ff6600] text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalEffort} hrs allocated</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#4617a8]/10 border border-[#4617a8]/20 text-[#4617a8] text-xs font-bold">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </div>
        </div>
      </div>

      {/* Grouped Projects View */}
      {groupedProjects.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-[#e7e9ed] shadow-clickup-sm">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1a1a1a]">No tasks assigned</h3>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 max-w-sm mx-auto mt-1">
            You do not have any tasks currently assigned to your account.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedProjects.map((group) => {
            return (
              <div
                key={group.projectId}
                className="bg-white rounded-3xl border border-[#e7e9ed] shadow-clickup-sm overflow-hidden"
              >
                {/* Project Subheader */}
                <div className="p-5 sm:p-6 bg-[#f8f9fb] border-b border-[#e7e9ed] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1a1a]/60">
                      <Building className="w-3.5 h-3.5 text-[#4617a8]" />
                      <span>{group.clientName}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#1a1a1a]">
                      {group.projectName}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#1a1a1a]/70">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>PM: <strong className="text-[#1a1a1a]">{group.managerName}</strong></span>
                    </div>
                    {group.projectDeadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Project Due: <strong className="text-[#1a1a1a]">{group.projectDeadline}</strong></span>
                      </div>
                    )}
                    <Link
                      href={`/projects/${group.projectId}`}
                      className="inline-flex items-center gap-1 text-[#4617a8] hover:text-[#381289] font-bold transition-colors"
                    >
                      <span>Project View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Tasks inside this project */}
                <div className="p-5 sm:p-6">
                  <TaskTable tasks={group.tasks} showAssignee={false} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
