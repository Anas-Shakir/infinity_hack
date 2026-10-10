"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { DEMO_PROJECTS, DEMO_USERS } from "@/lib/data";
import type { Client, Project, Role, Task, User } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const clientIdForName = (name: string) =>
  `client-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
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

interface AppContextValue {
  user: User | null;
  projects: Project[];
  clients: Client[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signup: (params: {
    name: string;
    email: string;
    password: string;
    role: Role;
    specialization: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  addProjects: (projects: Project[]) => Promise<void>;
  updateClient: (
    clientId: string,
    updates: Pick<Client, "name" | "industry" | "representativeName" | "representativePhone" | "managerId" | "manager">
  ) => Promise<void>;
  addTask: (projectId: string, task: Task) => Promise<void>;
  connectTaskToClient: (clientId: string, taskId: string) => Promise<void>;
  removeTaskFromClient: (clientId: string, taskId: string) => Promise<void>;
  toggleTask: (projectId: string, taskId: string) => Promise<void>;
  updateTask: (
    projectId: string,
    taskId: string,
    updates: Pick<Task, "title" | "description" | "assigneeId" | "assignee" | "deadline" | "estimatedHours">
  ) => Promise<void>;
  closeProject: (projectId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [clients, setClients] = useState<Client[]>(() => clientsFromProjects(DEMO_PROJECTS));
  const [loading, setLoading] = useState(true);

  // Fetch Database Data (Clients, Projects, Tasks) from Supabase
  const fetchData = useCallback(async () => {
    try {
      const [
        { data: clientsData, error: clientErr },
        { data: projectsData, error: projErr },
        { data: tasksData, error: taskErr },
      ] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*"),
      ]);

      if (clientErr) console.warn("Could not fetch clients from Supabase:", clientErr.message);
      if (projErr) console.warn("Could not fetch projects from Supabase:", projErr.message);
      if (taskErr) console.warn("Could not fetch tasks from Supabase:", taskErr.message);

      if (clientsData && clientsData.length > 0) {
        setClients(
          clientsData.map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry || "",
            representativeName: c.representative_name || "",
            representativePhone: c.representative_phone || "",
            managerId: c.manager_id || "",
            manager: c.manager || "",
          }))
        );
      }

      if (projectsData && projectsData.length > 0) {
        const assembledProjects: Project[] = projectsData.map((p) => ({
          id: p.id,
          name: p.name,
          client: p.client,
          description: p.description || "",
          managerId: p.manager_id,
          manager: p.manager,
          deadline: p.deadline,
          closed: Boolean(p.closed),
          tasks: (tasksData || [])
            .filter((t) => t.project_id === p.id)
            .map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description || "",
              assigneeId: t.assignee_id,
              assignee: t.assignee,
              deadline: t.deadline,
              estimatedHours: Number(t.estimated_hours) || 1,
              completed: Boolean(t.completed),
              clientId: t.client_id || null,
            })),
        }));
        setProjects(assembledProjects);
      }
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    }
  }, [supabase]);

  // Load User Profile
  const loadUserProfile = useCallback(async (authUserId: string, fallbackEmail?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUserId)
        .maybeSingle();

      if (profile && !error) {
        const resolvedUser: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          specialization: profile.specialization || "",
        };
        setUser(resolvedUser);
        window.localStorage.setItem("novaworks-user", JSON.stringify(resolvedUser));
        return;
      }

      // Fallback matching by email from DEMO_USERS
      if (fallbackEmail) {
        const demoMatch = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === fallbackEmail.toLowerCase()
        );
        if (demoMatch) {
          setUser(demoMatch);
          window.localStorage.setItem("novaworks-user", JSON.stringify(demoMatch));
        }
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  }, [supabase]);

  // Initial Auth & Data Load
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. Check local session cache for instant render
      const savedUser = window.localStorage.getItem("novaworks-user");
      if (savedUser && isMounted) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }

      // 2. Check Supabase Auth
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          await loadUserProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.warn("Supabase auth session check failed:", err);
      }

      // 3. Fetch Data
      if (isMounted) {
        await fetchData();
        setLoading(false);
      }
    }

    init();

    // Listen to Supabase Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        window.localStorage.removeItem("novaworks-user");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadUserProfile, fetchData]);

  // Login via Supabase Auth
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        return { ok: false, message: error?.message || "Invalid email or password." };
      }

      await loadUserProfile(data.user.id, data.user.email);
      await fetchData();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Unable to sign in.",
      };
    }
  };

  // Sign Up / Create Account via Supabase Auth
  const signup = async ({
    name,
    email,
    password,
    role,
    specialization,
  }: {
    name: string;
    email: string;
    password: string;
    role: Role;
    specialization: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            specialization: specialization.trim(),
          },
        },
      });

      if (error || !data.user) {
        return { ok: false, message: error?.message || "Failed to create account." };
      }

      // Create profile in public.profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        name: name.trim(),
        email: email.trim(),
        role,
        specialization: specialization.trim() || (role === "ADMIN" ? "Administrator" : role === "MANAGER" ? "Project Manager" : "Team Member"),
      }, { onConflict: "id" });

      if (profileError) {
        console.warn("Profile creation warning:", profileError.message);
      }

      if (data.session) {
        await loadUserProfile(data.user.id, data.user.email);
        await fetchData();
        return { ok: true };
      }

      return {
        ok: true,
        message: "Account created successfully! You can now sign in with your credentials.",
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Failed to create account.",
      };
    }
  };

  // Logout via Supabase Auth
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setUser(null);
    window.localStorage.removeItem("novaworks-user");
  };

  // Add Projects (AI transcript extraction or manual creation)
  const addProjects = async (incoming: Project[]) => {
    // 1. Optimistic local update
    const nextClients = clientsFromProjects([...incoming, ...projects], clients);
    setProjects((prev) => [...incoming, ...prev]);
    setClients(nextClients);

    // 2. Persist to Supabase
    try {
      for (const project of incoming) {
        const clientName = project.client.trim();
        const clientId = clientIdForName(clientName);

        // Upsert client
        await supabase.from("clients").upsert({
          id: clientId,
          name: clientName,
          manager_id: project.managerId,
          manager: project.manager,
        }, { onConflict: "id" });

        // Upsert project
        await supabase.from("projects").upsert({
          id: project.id,
          name: project.name,
          client: project.client,
          description: project.description,
          manager_id: project.managerId,
          manager: project.manager,
          deadline: project.deadline,
          closed: Boolean(project.closed),
        }, { onConflict: "id" });

        // Upsert tasks
        for (const task of project.tasks) {
          await supabase.from("tasks").upsert({
            id: task.id,
            project_id: project.id,
            client_id: task.clientId || clientId,
            title: task.title,
            description: task.description,
            assignee_id: task.assigneeId,
            assignee: task.assignee,
            deadline: task.deadline,
            estimated_hours: task.estimatedHours,
            completed: Boolean(task.completed),
          }, { onConflict: "id" });
        }
      }
    } catch (err) {
      console.error("Failed to sync new projects to Supabase:", err);
    }
  };

  // Toggle Task Completion
  const toggleTask = async (projectId: string, taskId: string) => {
    let nextCompleted = false;
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const tasks = project.tasks.map((task) => {
          if (task.id === taskId) {
            nextCompleted = !task.completed;
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        return {
          ...project,
          tasks,
          closed: tasks.length > 0 && tasks.every((task) => task.completed) ? project.closed : false,
        };
      })
    );

    try {
      await supabase.from("tasks").update({ completed: nextCompleted }).eq("id", taskId);
    } catch (err) {
      console.error("Failed to update task completion in Supabase:", err);
    }
  };

  // Add Task to Project
  const addTask = async (projectId: string, task: Task) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, tasks: [...project.tasks, task], closed: false }
          : project
      )
    );

    try {
      await supabase.from("tasks").insert({
        id: task.id,
        project_id: projectId,
        client_id: task.clientId || null,
        title: task.title,
        description: task.description,
        assignee_id: task.assigneeId,
        assignee: task.assignee,
        deadline: task.deadline,
        estimated_hours: task.estimatedHours,
        completed: Boolean(task.completed),
      });
    } catch (err) {
      console.error("Failed to insert task to Supabase:", err);
    }
  };

  // Update Client Details
  const updateClient: AppContextValue["updateClient"] = async (clientId, updates) => {
    const currentClient = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...updates } : c)));

    if (currentClient && currentClient.name !== updates.name) {
      setProjects((prev) =>
        prev.map((project) =>
          project.client === currentClient.name ? { ...project, client: updates.name } : project
        )
      );
    }

    try {
      await supabase.from("clients").update({
        name: updates.name,
        industry: updates.industry,
        representative_name: updates.representativeName,
        representative_phone: updates.representativePhone,
        manager_id: updates.managerId,
        manager: updates.manager,
      }).eq("id", clientId);

      if (currentClient && currentClient.name !== updates.name) {
        await supabase
          .from("projects")
          .update({ client: updates.name })
          .eq("client", currentClient.name);
      }
    } catch (err) {
      console.error("Failed to update client in Supabase:", err);
    }
  };

  // Connect Task to Client
  const connectTaskToClient = async (clientId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, clientId } : task)),
      }))
    );

    try {
      await supabase.from("tasks").update({ client_id: clientId }).eq("id", taskId);
    } catch (err) {
      console.error("Failed to connect task to client in Supabase:", err);
    }
  };

  // Remove Task from Client
  const removeTaskFromClient = async (clientId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        tasks: project.tasks.map((task) =>
          task.id === taskId && task.clientId === clientId ? { ...task, clientId: null } : task
        ),
      }))
    );

    try {
      await supabase.from("tasks").update({ client_id: null }).eq("id", taskId);
    } catch (err) {
      console.error("Failed to remove task from client in Supabase:", err);
    }
  };

  // Update Task Details
  const updateTask: AppContextValue["updateTask"] = async (projectId, taskId, updates) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : project
      )
    );

    try {
      await supabase.from("tasks").update({
        title: updates.title,
        description: updates.description,
        assignee_id: updates.assigneeId,
        assignee: updates.assignee,
        deadline: updates.deadline,
        estimated_hours: updates.estimatedHours,
      }).eq("id", taskId);
    } catch (err) {
      console.error("Failed to update task in Supabase:", err);
    }
  };

  // Close Project
  const closeProject = async (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, closed: true } : project))
    );

    try {
      await supabase.from("projects").update({ closed: true }).eq("id", projectId);
    } catch (err) {
      console.error("Failed to close project in Supabase:", err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      projects,
      clients,
      loading,
      login,
      signup,
      logout,
      addProjects,
      updateClient,
      addTask,
      connectTaskToClient,
      removeTaskFromClient,
      toggleTask,
      updateTask,
      closeProject,
      refreshData: fetchData,
    }),
    [user, projects, clients, loading, login, signup, logout, addProjects, updateClient, addTask, connectTaskToClient, removeTaskFromClient, toggleTask, updateTask, closeProject, fetchData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
