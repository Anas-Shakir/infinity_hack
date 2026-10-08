"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_PROJECTS, DEMO_USERS } from "@/lib/data";
import type { Client, Project, Task, User } from "@/lib/types";

const clientIdForName = (name: string) => `client-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const normalizedClientName = (name: string) => name.trim().toLowerCase();

function clientsFromProjects(projects: Project[], existing: Client[] = []): Client[] {
  const clients = [...existing];
  for (const project of projects) {
    const name = project.client.trim();
    if (!name || clients.some((client) => normalizedClientName(client.name) === normalizedClientName(name))) continue;
    clients.push({
      id: clientIdForName(name),
      name,
      industry: "",
      representativeName: "",
      representativePhone: "",
      managerId: project.managerId,
      manager: project.manager,
    });
  }
  return clients;
}

function attachLegacyTasks(projects: Project[], clients: Client[]): Project[] {
  return projects.map((project) => {
    const client = clients.find((item) => normalizedClientName(item.name) === normalizedClientName(project.client));
    return {
      ...project,
      tasks: project.tasks.map((task) => task.clientId === undefined ? { ...task, clientId: client?.id ?? null } : task),
    };
  });
}

interface AppContextValue {
  user: User | null;
  projects: Project[];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  addProjects: (projects: Project[]) => void;
  clients: Client[];
  updateClient: (clientId: string, updates: Pick<Client, "name" | "industry" | "representativeName" | "representativePhone" | "managerId" | "manager">) => void;
  addTask: (projectId: string, task: Task) => void;
  connectTaskToClient: (clientId: string, taskId: string) => void;
  removeTaskFromClient: (clientId: string, taskId: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  updateTask: (projectId: string, taskId: string, updates: Pick<Task, "title" | "description" | "assigneeId" | "assignee" | "deadline" | "estimatedHours">) => void;
  closeProject: (projectId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [clients, setClients] = useState<Client[]>(() => clientsFromProjects(DEMO_PROJECTS));

  useEffect(() => {
    const savedUser = window.localStorage.getItem("novaworks-user");
    const savedProjects = window.localStorage.getItem("novaworks-projects");
    const savedClients = window.localStorage.getItem("novaworks-clients");
    const restoredProjects: Project[] = savedProjects ? JSON.parse(savedProjects) : DEMO_PROJECTS;
    const restoredClients: Client[] = savedClients ? JSON.parse(savedClients) : [];
    const nextClients = clientsFromProjects(restoredProjects, restoredClients);
    const nextProjects = attachLegacyTasks(restoredProjects, nextClients);
    if (savedUser) setUser(JSON.parse(savedUser));
    setProjects(nextProjects);
    setClients(nextClients);
    window.localStorage.setItem("novaworks-projects", JSON.stringify(nextProjects));
    window.localStorage.setItem("novaworks-clients", JSON.stringify(nextClients));
  }, []);

  const login = (email: string, password: string) => {
    const found = DEMO_USERS.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!found || password !== "Demo123!") return { ok: false, message: "Invalid email or password." };
    setUser(found);
    window.localStorage.setItem("novaworks-user", JSON.stringify(found));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem("novaworks-user");
  };

  const addProjects = (incoming: Project[]) => {
    const nextClients = clientsFromProjects([...incoming, ...projects], clients);
    const nextProjects = attachLegacyTasks([...incoming, ...projects], nextClients);
    setProjects(nextProjects);
    setClients(nextClients);
    window.localStorage.setItem("novaworks-projects", JSON.stringify(nextProjects));
    window.localStorage.setItem("novaworks-clients", JSON.stringify(nextClients));
  };

  const persistProjects = (next: Project[]) => {
    setProjects(next);
    window.localStorage.setItem("novaworks-projects", JSON.stringify(next));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    const next = projects.map((project) => {
      if (project.id !== projectId) return project;
      const tasks = project.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
      return { ...project, tasks, closed: tasks.length > 0 && tasks.every((task) => task.completed) ? project.closed : false };
    });
    persistProjects(next);
  };

  const addTask = (projectId: string, task: Task) => {
    const next = projects.map((project) => project.id === projectId
      ? { ...project, tasks: [...project.tasks, task], closed: false }
      : project);
    persistProjects(next);
  };

  const updateClient: AppContextValue["updateClient"] = (clientId, updates) => {
    const currentClient = clients.find((client) => client.id === clientId);
    const nextClients = clients.map((client) => client.id === clientId ? { ...client, ...updates } : client);
    setClients(nextClients);
    window.localStorage.setItem("novaworks-clients", JSON.stringify(nextClients));
    if (currentClient && currentClient.name !== updates.name) {
      const nextProjects = projects.map((project) => project.client === currentClient.name
        ? { ...project, client: updates.name }
        : project);
      persistProjects(nextProjects);
    }
  };

  const connectTaskToClient = (clientId: string, taskId: string) => {
    const next = projects.map((project) => ({
      ...project,
      tasks: project.tasks.map((task) => task.id === taskId ? { ...task, clientId } : task),
    }));
    persistProjects(next);
  };

  const removeTaskFromClient = (clientId: string, taskId: string) => {
    const next = projects.map((project) => ({
      ...project,
      tasks: project.tasks.map((task) => task.id === taskId && task.clientId === clientId ? { ...task, clientId: null } : task),
    }));
    persistProjects(next);
  };

  const updateTask: AppContextValue["updateTask"] = (projectId, taskId, updates) => {
    const next = projects.map((project) => project.id === projectId
      ? { ...project, tasks: project.tasks.map((task) => task.id === taskId ? { ...task, ...updates } : task) }
      : project);
    persistProjects(next);
  };

  const closeProject = (projectId: string) => {
    const next = projects.map((project) => project.id === projectId
      ? { ...project, closed: true }
      : project);
    persistProjects(next);
  };

  const value = useMemo(() => ({ user, projects, clients, login, logout, addProjects, updateClient, addTask, connectTaskToClient, removeTaskFromClient, toggleTask, updateTask, closeProject }), [user, projects, clients]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
