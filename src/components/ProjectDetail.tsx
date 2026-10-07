"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";

export function ProjectDetail({ id }: { id: string }) {
  const { user, projects } = useApp();
  const project = projects.find((item) => item.id === id);
  if (!project || (user?.role === "MANAGER" && project.managerId !== user.id) || (user?.role === "AGENT" && !project.tasks.some((task) => task.assigneeId === user.id))) return <div className="access-denied"><span>!</span><h1>Project not found</h1><p>You do not have access to this project.</p><Link href="/dashboard" className="primary-button">Return to projects</Link></div>;
  const visibleTasks = user?.role === "AGENT" ? project.tasks.filter((task) => task.assigneeId === user.id) : project.tasks;

  return (
    <div className="project-detail">
      <Link className="back-link" href="/dashboard">← Back to projects</Link>
      <section className="project-hero"><div><p className="eyebrow">Project overview</p><h1>{project.name}</h1><p className="client-name">{project.client}</p></div><div className="project-info"><div><span>Manager</span><strong>{project.manager}</strong></div><div><span>Deadline</span><strong>{new Date(`${project.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></div><div><span>Tasks</span><strong>{visibleTasks.length}</strong></div></div></section>
      <section className="project-description"><h2>Project scope</h2><p>{project.description}</p></section>
      <section className="task-section"><div className="section-heading"><div><p className="eyebrow">Delivery plan</p><h2>Tasks</h2></div><span>{visibleTasks.reduce((sum, task) => sum + task.estimatedHours, 0)} estimated hours</span></div><div className="task-table-wrap"><table><thead><tr><th>Task</th><th>Description</th><th>Assigned to</th><th>Deadline</th><th>Hours</th></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task.id}><td><strong>{task.title}</strong></td><td>{task.description}</td><td>{task.assignee}</td><td>{new Date(`${task.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td><td><span className="hours-pill">{task.estimatedHours}h</span></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
