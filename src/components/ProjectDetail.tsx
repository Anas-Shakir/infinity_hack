"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { DEMO_USERS } from "@/lib/data";
import type { Task } from "@/lib/types";
import { useApp } from "./AppProvider";

export function ProjectDetail({ id }: { id: string }) {
  const { user, projects, clients, addTask, toggleTask, updateTask, closeProject } = useApp();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Pick<Task, "title" | "description" | "assigneeId" | "assignee" | "deadline" | "estimatedHours"> | null>(null);
  const [newTaskDraft, setNewTaskDraft] = useState<Pick<Task, "title" | "description" | "assigneeId" | "assignee" | "deadline" | "estimatedHours"> | null>(null);
  const project = projects.find((item) => item.id === id);
  if (!project || (user?.role === "MANAGER" && project.managerId !== user.id) || (user?.role === "AGENT" && !project.tasks.some((task) => task.assigneeId === user.id))) return <div className="access-denied"><span>!</span><h1>Project not found</h1><p>You do not have access to this project.</p><Link href="/dashboard" className="primary-button">Return to projects</Link></div>;
  const visibleTasks = user?.role === "AGENT" ? project.tasks.filter((task) => task.assigneeId === user.id) : project.tasks;
  const orderedTasks = [...visibleTasks].sort((first, second) => first.deadline.localeCompare(second.deadline));
  const canEditTasks = user?.role === "ADMIN" || (user?.role === "MANAGER" && project.managerId === user.id);
  const allTasksComplete = project.tasks.length > 0 && project.tasks.every((task) => task.completed);

  const beginEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setDraft({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      deadline: task.deadline,
      estimatedHours: task.estimatedHours,
    });
  };

  const saveTask = (event: FormEvent<HTMLFormElement>, taskId: string) => {
    event.preventDefault();
    if (!draft) return;
    const assignee = DEMO_USERS.find((candidate) => candidate.id === draft.assigneeId);
    updateTask(project.id, taskId, { ...draft, assignee: assignee?.name ?? draft.assignee });
    setEditingTaskId(null);
    setDraft(null);
  };

  const saveNewTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTaskDraft) return;
    const assignee = DEMO_USERS.find((candidate) => candidate.id === newTaskDraft.assigneeId);
    if (!assignee) return;
    const client = clients.find((candidate) => candidate.name.trim().toLowerCase() === project.client.trim().toLowerCase());
    addTask(project.id, {
      id: crypto.randomUUID(),
      ...newTaskDraft,
      assignee: assignee.name,
      completed: false,
      clientId: client?.id ?? null,
    });
    setNewTaskDraft(null);
  };

  return (
    <div className="project-detail">
      <Link className="back-link" href="/dashboard">← Back to projects</Link>
      <section className="project-hero"><div><p className="eyebrow">Project overview</p><h1>{project.name}</h1><p className="client-name">{project.client}</p></div><div className="project-info"><div><span>Manager</span><strong>{project.manager}</strong></div><div><span>Deadline</span><strong>{new Date(`${project.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></div><div><span>Tasks</span><strong>{visibleTasks.length}</strong></div></div></section>
      <section className="project-description"><h2>Project scope</h2><p>{project.description}</p></section>
      <section className="task-section">
        <div className="section-heading">
          <div><p className="eyebrow">Delivery plan</p><h2>Tasks</h2></div>
          <div className="task-section-actions">
            <span>{orderedTasks.filter((task) => task.completed).length} of {orderedTasks.length} complete</span>
            {canEditTasks && <button className="primary-button add-task-button" type="button" onClick={() => setNewTaskDraft({
              title: "",
              description: "",
              assigneeId: DEMO_USERS.find((candidate) => candidate.role === "AGENT")?.id ?? "",
              assignee: "",
              deadline: project.deadline,
              estimatedHours: 1,
            })}>Add task</button>}
          </div>
        </div>
        {canEditTasks && newTaskDraft && (
          <form className="task-edit-form new-task-form" onSubmit={saveNewTask}>
            <label>Task title<input required autoFocus value={newTaskDraft.title} onChange={(event) => setNewTaskDraft({ ...newTaskDraft, title: event.target.value })} /></label>
            <label>Description<textarea required rows={3} value={newTaskDraft.description} onChange={(event) => setNewTaskDraft({ ...newTaskDraft, description: event.target.value })} /></label>
            <div className="task-edit-fields">
              <label>Assignee<select required value={newTaskDraft.assigneeId} onChange={(event) => setNewTaskDraft({ ...newTaskDraft, assigneeId: event.target.value })}>
                {DEMO_USERS.filter((candidate) => candidate.role === "AGENT").map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
              </select></label>
              <label>Deadline<input required type="date" value={newTaskDraft.deadline} onChange={(event) => setNewTaskDraft({ ...newTaskDraft, deadline: event.target.value })} /></label>
              <label>Estimated hours<input required type="number" min="0.5" step="0.5" value={newTaskDraft.estimatedHours} onChange={(event) => setNewTaskDraft({ ...newTaskDraft, estimatedHours: Number(event.target.value) })} /></label>
            </div>
            <div className="task-edit-actions">
              <button className="primary-button" type="submit">Add task</button>
              <button className="secondary-button" type="button" onClick={() => setNewTaskDraft(null)}>Cancel</button>
            </div>
          </form>
        )}
        <ol className="task-list">{orderedTasks.map((task) => (
          <li className={`task-item${task.completed ? " is-complete" : ""}`} key={task.id}>
            <input
              id={`task-${task.id}`}
              type="checkbox"
              checked={Boolean(task.completed)}
              onChange={() => toggleTask(project.id, task.id)}
              aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.title}`}
            />
            <label className="task-item-content" htmlFor={`task-${task.id}`}>
              <strong>{task.title}</strong>
              <span>{task.description}</span>
              <small>Assigned to {task.assignee}</small>
            </label>
            <time className="task-deadline" dateTime={task.deadline}>{new Date(`${task.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
            {canEditTasks && editingTaskId !== task.id && (
              <button className="task-edit-button" type="button" onClick={() => beginEditing(task)}>Edit details</button>
            )}
            {canEditTasks && editingTaskId === task.id && draft && (
              <form className="task-edit-form" onSubmit={(event) => saveTask(event, task.id)}>
                <label>Task title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
                <label>Description<textarea required rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
                <div className="task-edit-fields">
                  <label>Assignee<select value={draft.assigneeId} onChange={(event) => setDraft({ ...draft, assigneeId: event.target.value })}>
                    {DEMO_USERS.filter((candidate) => candidate.role === "AGENT").map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
                  </select></label>
                  <label>Deadline<input required type="date" value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} /></label>
                  <label>Estimated hours<input required type="number" min="0.5" step="0.5" value={draft.estimatedHours} onChange={(event) => setDraft({ ...draft, estimatedHours: Number(event.target.value) })} /></label>
                </div>
                <div className="task-edit-actions">
                  <button className="primary-button" type="submit">Save changes</button>
                  <button className="secondary-button" type="button" onClick={() => { setEditingTaskId(null); setDraft(null); }}>Cancel</button>
                </div>
              </form>
            )}
          </li>
        ))}</ol>
        {allTasksComplete && !project.closed && (
          <button className="primary-button close-project-button" type="button" onClick={() => closeProject(project.id)}>Close task?</button>
        )}
        {project.closed && <p className="project-closed-notice">This project is closed.</p>}
      </section>
    </div>
  );
}
