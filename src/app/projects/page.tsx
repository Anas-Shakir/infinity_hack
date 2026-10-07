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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ed]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-[#4617a8]" />
            </div>
            <span>{pageTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1">{pageDesc}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/20 w-fit">
          {projects.length} {projects.length === 1 ? "Project" : "Projects"}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#e7e9ed] shadow-clickup-sm">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#1a1a1a]">No projects visible</h3>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1">
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
