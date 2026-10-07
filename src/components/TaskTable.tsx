import { TaskDetail } from "@/lib/access";
import { Clock, Calendar, AlertCircle } from "lucide-react";

interface TaskTableProps {
  tasks: TaskDetail[];
  showAssignee?: boolean;
  showProject?: boolean;
}

export default function TaskTable({
  tasks,
  showAssignee = true,
  showProject = false,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#e7e9ed]">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#1a1a1a]/70">No tasks found in this view.</p>
      </div>
    );
  }

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[#e7e9ed] bg-white shadow-clickup-sm">
        <table className="min-w-full divide-y divide-[#e7e9ed] text-left text-sm">
          <thead className="bg-[#f8f9fb] text-[11px] font-bold text-[#1a1a1a]/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Task Title & Description
              </th>
              {showProject && (
                <th scope="col" className="px-5 py-3.5">
                  Project
                </th>
              )}
              {showAssignee && (
                <th scope="col" className="px-5 py-3.5">
                  Assigned Agent
                </th>
              )}
              <th scope="col" className="px-5 py-3.5">
                Deadline
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Est. Effort
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f2f5] bg-white">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#f8f9fb] transition-colors group">
                <td className="px-5 py-4 max-w-md">
                  <div className="font-bold text-[#1a1a1a] group-hover:text-[#4617a8] transition-colors">
                    {task.title}
                  </div>
                  {task.description && (
                    <p className="mt-1 text-xs text-[#1a1a1a]/60 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </td>

                {showProject && task.project && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-[#1a1a1a]">{task.project.name}</div>
                    <div className="text-xs text-gray-500">{task.project.clientName}</div>
                  </td>
                )}

                {showAssignee && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center font-bold text-xs border border-[#4617a8]/20">
                        {task.assignee?.name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1a1a1a] text-xs">
                          {task.assignee?.name || "Unassigned"}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {task.assignee?.specialization || task.assigneeId}
                        </div>
                      </div>
                    </div>
                  </td>
                )}

                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1a1a1a]/80 bg-[#f8f9fb] px-2.5 py-1 rounded-md border border-[#e7e9ed] w-fit">
                    <Calendar className="w-3.5 h-3.5 text-[#4617a8]" />
                    <span>{task.deadline}</span>
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1 font-bold bg-[#ff6600]/10 text-[#ff6600] border border-[#ff6600]/25 px-2.5 py-1 rounded-md text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedHours} hrs</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2 text-xs text-gray-500">
        <span>Showing {tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1a1a1a]">Total Effort:</span>
          <span className="font-bold text-[#4617a8] bg-[#4617a8]/10 px-2.5 py-0.5 rounded-full border border-[#4617a8]/20">
            {totalHours} hrs
          </span>
        </div>
      </div>
    </div>
  );
}
