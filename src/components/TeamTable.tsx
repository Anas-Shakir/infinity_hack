import { ShieldCheck, Briefcase, Code2 } from "lucide-react";

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/25">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4617a8]" /> Administrator
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Project Manager
          </span>
        );
      case "AGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Developer Agent
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-[#1a1a1a]">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e7e9ed] bg-white shadow-clickup-sm">
      <table className="min-w-full divide-y divide-[#e7e9ed] text-left text-sm">
        <thead className="bg-[#f8f9fb] text-[11px] font-bold text-[#1a1a1a]/60 uppercase tracking-wider">
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
        <tbody className="divide-y divide-[#f0f2f5] bg-white">
          {team.map((member) => (
            <tr key={member.id} className="hover:bg-[#f8f9fb] transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f8f9fb] border border-[#e7e9ed] flex items-center justify-center font-bold text-[#4617a8] text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#1a1a1a] group-hover:text-[#4617a8] transition-colors">
                      {member.name}
                    </div>
                    <div className="text-xs font-mono text-gray-400">ID: {member.id}</div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(member.role)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-[#1a1a1a]/80">{member.specialization}</span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5 max-w-md">
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#f8f9fb] text-[#1a1a1a]/80 border border-[#e7e9ed]"
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
