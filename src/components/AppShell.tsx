"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "./AppProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && pathname !== "/") router.replace("/");
  }, [pathname, router, user]);

  if (!user) return children;
  const nav = user.role === "ADMIN"
    ? [{ label: "Clients", href: "/clients" }, { label: "Projects", href: "/dashboard" }, { label: "Create from transcript", href: "/transcript" }, { label: "Team", href: "/team" }]
    : user.role === "MANAGER"
      ? [{ label: "Clients", href: "/clients" }, { label: "My projects", href: "/dashboard" }, { label: "Team", href: "/team" }]
      : [{ label: "Clients", href: "/clients" }, { label: "My tasks", href: "/dashboard" }, { label: "Team", href: "/team" }];

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/dashboard"><Image className="genesis-logo" src="/logo_main.png" alt="Genesis" width={335} height={110} priority /></Link>
        <nav>{nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <div className="user-menu"><span className="avatar">{user.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{user.name}</strong><small className={`role-${user.role.toLowerCase()}`}>{user.role}</small></div><button onClick={logout}>Logout</button></div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
