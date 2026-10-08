"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";

export function Dashboard() {
  const { user, projects } = useApp();
  const visible = user?.role === "MANAGER" ? projects.filter((project) => project.managerId === user.id) : user?.role === "AGENT" ? projects.filter((project) => project.tasks.some((task) => task.assigneeId === user.id)) : projects;

  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="dashboard-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>{user?.role === "ADMIN" ? "All projects" : user?.role === "MANAGER" ? "My projects" : "My tasks"}</h1>
          <p>Track client work, owners, deadlines, and delivery effort.</p>
        </div>
        {user?.role === "ADMIN" && (
          <Link className="primary-button" href="/transcript">+ Create from transcript</Link>
        )}
      </section>

      {visible.length ? (
        <section className="dashboard-board" aria-label="Project overview">
          <div className="board-grid">
            {visible.map((project) => {
              return (
                <Link className="project-sheet" href={`/projects/${project.id}`} key={project.id}>
                  <div className="sheet-header">
                    <span className={`sheet-status ${project.closed ? "closed" : "active"}`}>{project.closed ? "Closed" : "Active"}</span>
                    <span className="sheet-date">{formatDate(project.deadline)}</span>
                  </div>

                  <div className="sheet-body">
                    <div className="sheet-title-wrap">
                      <h2 className="project-title">{project.name}</h2>
                    </div>
                    <div className="sheet-manager">{project.manager}</div>
                  </div>

                  <div className="task-panel" aria-hidden="true">
                    <span className="task-count">{project.tasks.length} Tasks</span>
                    <div className="task-bars">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="empty-state"><span>✓</span><h2>No projects yet</h2><p>New project data will appear here after a transcript is processed.</p></div>
      )}
    </div>
  );
}
