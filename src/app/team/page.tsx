import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TeamTable from "@/components/TeamTable";
import { Users } from "lucide-react";

export default async function TeamPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dbUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      specialization: true,
      skills: true,
    },
    orderBy: { id: "asc" },
  });

  const team = dbUsers.map((u) => {
    let skills: string[] = [];
    try {
      skills = JSON.parse(u.skills);
    } catch {
      skills = [];
    }
    return {
      id: u.id,
      name: u.name,
      role: u.role,
      specialization: u.specialization,
      skills,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <span>NovaWorks Team Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Read-only directory of project managers, developer agents, and administrators.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {team.length} Team Members
        </span>
      </div>

      <TeamTable team={team} />
    </div>
  );
}
