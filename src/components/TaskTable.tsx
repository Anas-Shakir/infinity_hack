import { TaskDetail } from "@/lib/access";
import { Clock, Calendar, UserCheck, AlertCircle } from "lucide-react";

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
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">No tasks found in this view.</p>
      </div>
    );
  }

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
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
          <tbody className="divide-y divide-slate-200 bg-white">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 max-w-md">
                  <div className="font-semibold text-slate-900">{task.title}</div>
                  {task.description && (
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </td>

                {showProject && task.project && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{task.project.name}</div>
                    <div className="text-xs text-slate-500">{task.project.clientName}</div>
                  </td>
                )}

                {showAssignee && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {task.assignee?.name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {task.assignee?.name || "Unassigned"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {task.assignee?.specialization || task.assigneeId}
                        </div>
                      </div>
                    </div>
                  </td>
                )}

                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{task.deadline}</span>
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1 font-bold text-slate-900 bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedHours} hrs</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>Showing {tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
        <span className="font-semibold text-slate-700">
          Total Estimated Effort: <span className="text-brand-600 font-bold">{totalHours} hrs</span>
        </span>
      </div>
    </div>
  );
}
