"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";

const formatDate = (date: string | null) => date
  ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "Not scheduled";

export function ClientsPage() {
  const { user, clients, projects } = useApp();
  const visibleProjects = projects.filter((project) =>
    user?.role === "ADMIN" ||
    (user?.role === "MANAGER" && project.managerId === user.id) ||
    (user?.role === "AGENT" && project.tasks.some((task) => task.assigneeId === user.id)),
  );
  const upcomingProjects = visibleProjects.filter((project) =>
    !project.closed && project.deadline >= new Date().toISOString().slice(0, 10),
  );
  const visibleClients = clients.filter((client) =>
    user?.role === "ADMIN" ||
    client.managerId === user?.id ||
    visibleProjects.some((project) => project.tasks.some((task) => task.clientId === client.id)),
  );

  return (
    <div className="clients-page">
      <h1 className="clients-title">Your<br />Clients.</h1>
      <section className="clients-frame" aria-label="Client directory">
        <div className="clients-panel">
          <div className="clients-summary">
            <span>{visibleClients.length} Current Clients</span>
            <span>{upcomingProjects.length} Projects Upcoming</span>
          </div>
          <div className="client-card-grid">
            {visibleClients.map((client) => {
              const clientTasks = visibleProjects.flatMap((project) =>
                project.tasks
                  .filter((task) => task.clientId === client.id)
                  .map((task) => ({ task, project })),
              );
              const projectIds = new Set(clientTasks.map(({ project }) => project.id));
              const totalHours = clientTasks.reduce((sum, { task }) => sum + task.estimatedHours, 0);
              const nextDue = clientTasks
                .map(({ task }) => task.deadline)
                .filter((deadline) => deadline >= new Date().toISOString().slice(0, 10))
                .sort()[0] ?? null;

              return (
                <Link className="client-card" href={`/clients/${encodeURIComponent(client.id)}`} key={client.id}>
                  <h2>{client.name}</h2>
                  <p className="client-industry">{client.industry || "Company type not set"}</p>
                  <div className="client-contact">
                    <span>{client.representativeName || "Representative not set"}</span>
                    <span>{client.representativePhone || "Phone not set"}</span>
                  </div>
                  <p className="client-manager">{client.manager || "Manager not assigned"}</p>
                  <div className="client-card-metrics">
                    <div><span>Projects</span><strong>{projectIds.size}</strong></div>
                    <div><span>Time estimate</span><strong>{totalHours} hrs</strong></div>
                    <div><span>Next due</span><strong>{formatDate(nextDue)}</strong></div>
                  </div>
                </Link>
              );
            })}
            {!visibleClients.length && <p className="clients-empty">Clients will appear here when projects are added.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
