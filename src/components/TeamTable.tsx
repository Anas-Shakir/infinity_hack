import { Users, ShieldCheck, Briefcase, Code2, Sparkles } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  skills: string[];
}

export default function TeamTable({ team }: { team: TeamMember[] }) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrator
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" /> Project Manager
          </span>
        );
      case "AGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Code2 className="w-3.5 h-3.5" /> Developer Agent
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4">
              Team Member
            </th>
            <th scope="col" className="px-6 py-4">
              Role
            </th>
            <th scope="col" className="px-6 py-4">
              Specialization
            </th>
            <th scope="col" className="px-6 py-4">
              Core Skills
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {team.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{member.name}</div>
                    <div className="text-xs font-mono text-slate-400">ID: {member.id}</div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(member.role)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-slate-700">{member.specialization}</span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5 max-w-md">
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
