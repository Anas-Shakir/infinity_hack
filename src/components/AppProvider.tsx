"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_PROJECTS, DEMO_USERS } from "@/lib/data";
import type { Project, User } from "@/lib/types";

interface AppContextValue {
  user: User | null;
  projects: Project[];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  addProjects: (projects: Project[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("novaworks-user");
    const savedProjects = window.localStorage.getItem("novaworks-projects");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
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
    const next = [...incoming, ...projects];
    setProjects(next);
    window.localStorage.setItem("novaworks-projects", JSON.stringify(next));
  };

  const value = useMemo(() => ({ user, projects, login, logout, addProjects }), [user, projects]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
