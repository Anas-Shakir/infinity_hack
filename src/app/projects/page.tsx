import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/access";
import ProjectCard from "@/components/ProjectCard";
import { FolderGit2, AlertCircle } from "lucide-react";

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await getProjects(user);

  let pageTitle = "Projects";
  let pageDesc = "View active client engagements.";

  if (user.role === "ADMIN") {
    pageTitle = "All Company Projects";
    pageDesc = "Full directory of projects across all clients and managers.";
  } else if (user.role === "MANAGER") {
    pageTitle = "My Managed Projects";
    pageDesc = "Projects assigned under your management.";
  } else if (user.role === "AGENT") {
    pageTitle = "Projects with My Tasks";
    pageDesc = "Client projects containing development tasks assigned to you.";
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FolderGit2 className="w-8 h-8 text-brand-600" />
            <span>{pageTitle}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">{pageDesc}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {projects.length} {projects.length === 1 ? "Project" : "Projects"}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No projects visible</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no projects available matching your role permissions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
