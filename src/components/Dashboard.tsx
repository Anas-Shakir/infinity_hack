"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";

export function Dashboard() {
  const { user, projects } = useApp();
  const visible = user?.role === "MANAGER" ? projects.filter((project) => project.managerId === user.id) : user?.role === "AGENT" ? projects.filter((project) => project.tasks.some((task) => task.assigneeId === user.id)) : projects;
  const taskCount = visible.reduce((sum, project) => sum + project.tasks.length, 0);

  return (
    <div className="dashboard">
      <section className="page-heading"><div><p className="eyebrow">Workspace overview</p><h1>{user?.role === "ADMIN" ? "All projects" : user?.role === "MANAGER" ? "My projects" : "My tasks"}</h1><p>Track client work, owners, deadlines, and delivery effort.</p></div>{user?.role === "ADMIN" && <Link className="primary-button" href="/transcript">+ Create from transcript</Link>}</section>
      <section className="metric-grid"><div className="metric"><span>Active projects</span><strong>{visible.length}</strong><small>Across your workspace</small></div><div className="metric"><span>Tasks assigned</span><strong>{taskCount}</strong><small>Visible to your role</small></div><div className="metric"><span>Current user</span><strong>{user?.role}</strong><small>{user?.name}</small></div></section>
      <section className="project-grid">
        {visible.map((project) => <article className="project-card" key={project.id}><div className="project-card-top"><span className="project-icon">{project.name[0]}</span><span className="status-dot">Active</span></div><h2>{project.name}</h2><p className="client-name">{project.client}</p><div className="project-meta"><span>Manager</span><strong>{project.manager}</strong><span>Deadline</span><strong>{new Date(`${project.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong><span>Tasks</span><strong>{project.tasks.length}</strong></div><Link href={`/projects/${project.id}`}>View project <span>→</span></Link></article>)}
      </section>
      {!visible.length && <div className="empty-state"><span>✓</span><h2>No projects yet</h2><p>New project data will appear here after a transcript is processed.</p></div>}
    </div>
  );
}
