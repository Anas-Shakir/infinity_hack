"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { DEMO_USERS } from "@/lib/data";
import type { Client } from "@/lib/types";
import { useApp } from "./AppProvider";

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function ClientDetail({ id }: { id: string }) {
  const { user, clients, projects, updateClient, connectTaskToClient, removeTaskFromClient } = useApp();
  const [editDraft, setEditDraft] = useState<Pick<Client, "name" | "industry" | "representativeName" | "representativePhone" | "managerId" | "manager"> | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const client = clients.find((entry) => entry.id === id);
  const visibleProjects = projects.filter((project) =>
    user?.role === "ADMIN" ||
    (user?.role === "MANAGER" && project.managerId === user.id) ||
    (user?.role === "AGENT" && project.tasks.some((task) => task.assigneeId === user.id && task.clientId === id)),
  );
  if (!client || (user?.role !== "ADMIN" && client.managerId !== user?.id && visibleProjects.length === 0)) {
    return <div className="access-denied"><span>!</span><h1>Client not found</h1><p>You do not have access to this client.</p><Link href="/clients" className="primary-button">Return to clients</Link></div>;
  }

  const canEditClient = user?.role === "ADMIN" || user?.role === "MANAGER";
  const connectedTasks = visibleProjects.flatMap((project) =>
    project.tasks
      .filter((task) => task.clientId === client.id && (user?.role !== "AGENT" || task.assigneeId === user.id))
      .map((task) => ({ task, project })),
  ).sort((first, second) => first.task.deadline.localeCompare(second.task.deadline));
  const availableTasks = visibleProjects.flatMap((project) =>
    project.tasks
      .filter((task) => !task.clientId && (user?.role !== "AGENT" || task.assigneeId === user.id))
      .map((task) => ({ task, project })),
  );
  const dueDates = new Set(connectedTasks
    .filter(({ task }) => !task.completed && task.deadline >= dateKey(new Date()))
    .map(({ task }) => task.deadline));
  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1).getDay();
  const todayKey = dateKey(new Date());
  const monthTitle = displayedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const managerChoices = DEMO_USERS.filter((candidate) => candidate.role === "MANAGER");

  const saveClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editDraft) return;
    const manager = managerChoices.find((candidate) => candidate.id === editDraft.managerId);
    updateClient(client.id, { ...editDraft, manager: manager?.name ?? editDraft.manager });
    setEditDraft(null);
  };

  const connectSelectedTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTaskId) return;
    connectTaskToClient(client.id, selectedTaskId);
    setSelectedTaskId("");
  };

  return (
    <div className="client-detail-page">
      <Link className="back-link" href="/clients">← Back to clients</Link>
      <section className="client-detail-hero">
        <div>
          <p className="eyebrow">Client profile</p>
          <h1>{client.name}</h1>
          <p>{client.industry || "Company type not set"}</p>
        </div>
        {canEditClient && !editDraft && (
          <button className="primary-button" type="button" onClick={() => setEditDraft({
            name: client.name,
            industry: client.industry,
            representativeName: client.representativeName,
            representativePhone: client.representativePhone,
            managerId: client.managerId,
            manager: client.manager,
          })}>Edit client details</button>
        )}
      </section>
      <section className="client-profile-info" aria-label="Client contact details">
        <div><span>Representative</span><strong>{client.representativeName || "Not provided"}</strong><small>{client.representativePhone || "Phone not provided"}</small></div>
        <div><span>Account manager</span><strong>{client.manager || "Not assigned"}</strong></div>
      </section>

      {canEditClient && editDraft && (
        <form className="client-edit-form" onSubmit={saveClient}>
          <label>Company name<input required value={editDraft.name} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} /></label>
          <label>Company type<input value={editDraft.industry} onChange={(event) => setEditDraft({ ...editDraft, industry: event.target.value })} /></label>
          <label>Representative name<input value={editDraft.representativeName} onChange={(event) => setEditDraft({ ...editDraft, representativeName: event.target.value })} /></label>
          <label>Representative phone<input type="tel" value={editDraft.representativePhone} onChange={(event) => setEditDraft({ ...editDraft, representativePhone: event.target.value })} /></label>
          <label>Manager<select required value={editDraft.managerId} onChange={(event) => {
            const manager = managerChoices.find((candidate) => candidate.id === event.target.value);
            setEditDraft({ ...editDraft, managerId: event.target.value, manager: manager?.name ?? "" });
          }}>
            {managerChoices.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
          </select></label>
          <div className="task-edit-actions">
            <button className="primary-button" type="submit">Save client</button>
            <button className="secondary-button" type="button" onClick={() => setEditDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="client-detail-grid">
        <section className="client-tasks-card">
          <div className="section-heading">
            <div><p className="eyebrow">Connected work</p><h2>Client tasks</h2></div>
            <span>{connectedTasks.length} tasks</span>
          </div>
          {canEditClient && (
            <form className="connect-task-form" onSubmit={connectSelectedTask}>
              <label htmlFor="connect-client-task">Connect a task</label>
              <select id="connect-client-task" value={selectedTaskId} onChange={(event) => setSelectedTaskId(event.target.value)} disabled={!availableTasks.length}>
                <option value="">{availableTasks.length ? "Choose an unlinked task" : "No unlinked tasks available"}</option>
                {availableTasks.map(({ task, project }) => <option key={task.id} value={task.id}>{task.title} — {project.name}</option>)}
              </select>
              <button className="primary-button" type="submit" disabled={!selectedTaskId}>Connect</button>
            </form>
          )}
          {connectedTasks.length ? (
            <ul className="connected-task-list">
              {connectedTasks.map(({ task, project }) => (
                <li key={task.id}>
                  <div>
                    <Link href={`/projects/${project.id}`} className="connected-task-title">{task.title}</Link>
                    <span>{project.name} · {task.assignee} · Due {formatDate(task.deadline)}</span>
                  </div>
                  {canEditClient && <button className="task-remove-button" type="button" onClick={() => removeTaskFromClient(client.id, task.id)}>Remove</button>}
                </li>
              ))}
            </ul>
          ) : <p className="client-no-tasks">No tasks are currently connected to this client.</p>}
        </section>

        <section className="client-calendar-card" aria-label="Client task calendar">
          <div className="calendar-heading">
            <div><p className="eyebrow">Deadlines</p><h2>{monthTitle}</h2></div>
            <div className="calendar-controls">
              <button type="button" aria-label="Previous month" onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1))}>‹</button>
              <button type="button" aria-label="Next month" onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1))}>›</button>
            </div>
          </div>
          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => <span className="calendar-weekday" key={weekday}>{weekday}</span>)}
            {Array.from({ length: firstWeekday }, (_, index) => <span className="calendar-day is-empty" key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dayDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), day);
              const key = dateKey(dayDate);
              const isToday = key === todayKey;
              const hasDeadline = dueDates.has(key);
              return (
                <span className={`calendar-day${isToday ? " is-today" : ""}${hasDeadline ? " has-deadline" : ""}`} key={key} title={hasDeadline ? "Upcoming client task deadline" : undefined}>
                  {day}
                  {hasDeadline && <i aria-hidden="true" />}
                </span>
              );
            })}
          </div>
          <div className="calendar-legend"><span><i className="legend-today" />Today</span><span><i className="legend-deadline" />Upcoming deadline</span></div>
        </section>
      </div>
    </div>
  );
}
