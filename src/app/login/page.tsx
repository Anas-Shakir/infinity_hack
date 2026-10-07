"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  FolderGit2, 
  Loader2, 
  ShieldCheck, 
  Briefcase, 
  Code2, 
  ArrowRight,
  AlertCircle 
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    label: "Admin",
    name: "Admin",
    email: "admin@novaworks.example",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ShieldCheck,
    note: "All projects & AI Transcript tool",
  },
  {
    role: "MANAGER",
    label: "Manager",
    name: "Ayesha Khan",
    email: "ayesha@novaworks.example",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Briefcase,
    note: "Web PM (UrbanCart)",
  },
  {
    role: "MANAGER",
    label: "Manager",
    name: "Bilal Ahmed",
    email: "bilal@novaworks.example",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Briefcase,
    note: "Mobile PM (QuickServe)",
  },
  {
    role: "AGENT",
    label: "Agent",
    name: "Ali Raza",
    email: "ali@novaworks.example",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Code2,
    note: "Full-Stack Dev (3 UrbanCart tasks)",
  },
  {
    role: "AGENT",
    label: "Agent",
    name: "Hamza Shah",
    email: "hamza@novaworks.example",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Code2,
    note: "API Dev (Tasks in 2 projects)",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@novaworks.example");
  const [password, setPassword] = useState("Demo123!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Role-based redirect
      const role = data.user.role;
      if (role === "ADMIN") {
        router.push("/");
      } else if (role === "MANAGER") {
        router.push("/projects");
      } else if (role === "AGENT") {
        router.push("/my-tasks");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo123!");
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Quick Demo Select */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>NovaWorks Technologies</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Meeting to Execution CRM
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Convert raw meeting transcripts into structured project plans, roles, tasks, and deadlines with AI.
            </p>
          </div>

          {/* Demo Accounts List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fast Demo Accounts
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Pass: Demo123!</span>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${acc.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          <span className="text-[10px] font-normal text-slate-500">({acc.label})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.note}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/40">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Sign In to Your Workspace</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your demo credentials to access role-specific projects and tasks.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@novaworks.example"
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Demo123!"
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
