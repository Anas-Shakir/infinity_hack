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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ed]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4617a8]/10 text-[#4617a8] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#4617a8]" />
            </div>
            <span>Genesis Team Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/60 mt-1">
            Read-only directory of project managers, developer agents, and administrators.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/20 w-fit">
          {team.length} Team Members
        </span>
      </div>

      <TeamTable team={team} />
    </div>
  );
}
