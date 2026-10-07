"use client";

import { DEMO_USERS } from "@/lib/data";
import { useApp } from "./AppProvider";

export function TeamPage() {
  const { user } = useApp();
  const roles = user?.role === "ADMIN" ? DEMO_USERS : DEMO_USERS.filter((member) => member.role === "MANAGER" || member.role === "AGENT");

  return (
    <div className="team-page">
      <section className="page-heading"><div><p className="eyebrow">People directory</p><h1>Team members</h1><p>Read-only directory of the people involved in delivery.</p></div></section>
      <section className="team-table-card">
        <div className="team-toolbar"><div><h2>Company directory</h2><span>{roles.length} team members</span></div></div>
        <div className="team-table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Specialization</th></tr></thead><tbody>{roles.map((member) => <tr key={member.id}><td><div className="member-cell"><span className="avatar">{member.name.split(" ").map((part) => part[0]).join("")}</span><strong>{member.name}</strong></div></td><td><span className={`role-badge role-${member.role.toLowerCase()}`}>{member.role}</span></td><td>{member.specialization}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
