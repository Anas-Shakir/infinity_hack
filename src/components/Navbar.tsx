"use client";

import Link from "next/link";
import Image from "next/image";
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4617a8]/10 text-[#4617a8] border border-[#4617a8]/25">
            <ShieldCheck className="w-3 h-3 text-[#4617a8]" /> Admin
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3 text-blue-600" /> Manager
          </span>
        );
      case "AGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Code2 className="w-3 h-3 text-emerald-600" /> Agent
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-[#1a1a1a]">
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

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e7e9ed] bg-white/95 backdrop-blur-md shadow-clickup-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
              <Image
                src="/logo_main.png"
                alt="Genesis Logo"
                width={124}
                height={34}
                priority
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                if (link.highlight) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isActive
                          ? "bg-[#4617a8] text-white shadow-genesis-glow ring-2 ring-[#4617a8]/30"
                          : "bg-gradient-to-r from-[#4617a8] via-[#8b1fa3] to-[#ff6600] text-white hover:opacity-95 hover:shadow"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                        ? "bg-[#4617a8]/10 text-[#4617a8] font-bold"
                        : "text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#f3f4f8]"
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4617a8]" : "text-gray-400"}`} />
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
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-[#e7e9ed] transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-red-500" : ""}`} />
                <span>{resetMessage || (isResetting ? "Resetting..." : "Reset Data")}</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 pl-3 border-l border-[#e7e9ed]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4617a8] to-[#ff6600] p-[1.5px] flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[11px] font-bold text-[#4617a8]">
                  {initials}
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-[#1a1a1a]">{user.name}</span>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>

              <div className="sm:hidden">
                {getRoleBadge(user.role)}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Log out"
                className="ml-1 p-2 rounded-lg text-gray-400 hover:text-[#1a1a1a] hover:bg-[#f3f4f8] transition-colors"
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
