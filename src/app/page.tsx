import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/access";
import ProjectCard from "@/components/ProjectCard";
import { Sparkles, FolderPlus, Layers } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect agents directly to their personal tasks view
  if (user.role === "AGENT") {
    redirect("/my-tasks");
  }

  const projects = await getProjects(user);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {user.role === "ADMIN" ? "All Projects Overview" : "My Assigned Projects"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              {projects.length} {projects.length === 1 ? "Project" : "Projects"}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {user.role === "ADMIN"
              ? "Comprehensive overview of client projects extracted and active across NovaWorks."
              : "Projects you are currently managing and coordinating."}
          </p>
        </div>

        {user.role === "ADMIN" && (
          <Link
            href="/transcript"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create from Transcript</span>
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {user.role === "ADMIN"
              ? "No active client projects exist yet. Generate projects automatically from a meeting transcript."
              : "You do not have any projects assigned to manage at this time."}
          </p>
          {user.role === "ADMIN" && (
            <Link
              href="/transcript"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create from Transcript</span>
            </Link>
          )}
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
