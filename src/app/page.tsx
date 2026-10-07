import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/access";
import ProjectCard from "@/components/ProjectCard";
import { Sparkles, Layers } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ed]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
              {user.role === "ADMIN" ? "All Projects Overview" : "My Assigned Projects"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/20">
              {projects.length} {projects.length === 1 ? "Project" : "Projects"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1">
            {user.role === "ADMIN"
              ? "Comprehensive overview of client projects extracted and active across Genesis."
              : "Projects you are currently managing and coordinating."}
          </p>
        </div>

        {user.role === "ADMIN" && (
          <Link
            href="/transcript"
            className="genesis-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Create from Transcript</span>
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-[#e7e9ed] shadow-clickup-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">No projects found</h3>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 max-w-md mx-auto mt-1 mb-6">
            {user.role === "ADMIN"
              ? "No active client projects exist yet. Generate projects automatically from a meeting transcript."
              : "You do not have any projects assigned to manage at this time."}
          </p>
          {user.role === "ADMIN" && (
            <Link
              href="/transcript"
              className="genesis-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white"
            >
              <Sparkles className="w-4 h-4 text-white" />
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
