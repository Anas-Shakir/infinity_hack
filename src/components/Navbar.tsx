"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Building2, 
  FolderGit2, 
  CheckSquare, 
  Users, 
  Sparkles, 
  LogOut, 
  RotateCcw,
  ShieldCheck,
  Briefcase,
  Code2
} from "lucide-react";

interface AuthUserProps {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function Navbar({ user }: { user: AuthUserProps }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset all generated projects and tasks? Seeded users will be preserved.")) {
      return;
    }
    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        setResetMessage("Projects reset!");
        setTimeout(() => setResetMessage(null), 3000);
        router.refresh();
      }
    } catch {
      alert("Failed to reset demo data.");
    } finally {
      setIsResetting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Briefcase className="w-3 h-3" /> Manager
          </span>
        );
      case "AGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Code2 className="w-3 h-3" /> Agent
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
            {role}
          </span>
        );
    }
  };

  const navLinks = [
    ...(user.role === "ADMIN"
      ? [
          { href: "/", label: "Home", icon: Building2 },
          { href: "/projects", label: "Projects", icon: FolderGit2 },
          { href: "/transcript", label: "Create from Transcript", icon: Sparkles, highlight: true },
          { href: "/team", label: "Team", icon: Users },
        ]
      : []),
    ...(user.role === "MANAGER"
      ? [
          { href: "/projects", label: "My Projects", icon: FolderGit2 },
          { href: "/team", label: "Team", icon: Users },
        ]
      : []),
    ...(user.role === "AGENT"
      ? [
          { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
          { href: "/team", label: "Team", icon: Users },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                  NovaWorks PM
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Meeting to Execution CRM
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : link.highlight
                        ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${link.highlight && !isActive ? "text-indigo-600" : ""}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" && (
              <button
                onClick={handleResetData}
                disabled={isResetting}
                title="Reset demo projects/tasks without deleting seeded users"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
                <span>{resetMessage || (isResetting ? "Resetting..." : "Reset Data")}</span>
              </button>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-900">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <div className="sm:hidden">
                {getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Log out of session"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
