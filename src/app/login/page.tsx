"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
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
    badge: "bg-[#4617a8]/10 text-[#4617a8] border-[#4617a8]/20",
    icon: ShieldCheck,
    note: "All projects & AI Transcript tool",
  },
  {
    role: "MANAGER",
    label: "Manager",
    name: "Ayesha Khan",
    email: "ayesha@novaworks.example",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Briefcase,
    note: "Web PM (UrbanCart)",
  },
  {
    role: "MANAGER",
    label: "Manager",
    name: "Bilal Ahmed",
    email: "bilal@novaworks.example",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Briefcase,
    note: "Mobile PM (QuickServe)",
  },
  {
    role: "AGENT",
    label: "Agent",
    name: "Ali Raza",
    email: "ali@novaworks.example",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Code2,
    note: "Full-Stack Dev (3 UrbanCart tasks)",
  },
  {
    role: "AGENT",
    label: "Agent",
    name: "Hamza Shah",
    email: "hamza@novaworks.example",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
          <div className="space-y-3">
            <div className="flex items-center">
              <Image
                src="/logo_main.png"
                alt="Genesis"
                width={150}
                height={42}
                priority
                className="h-9 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
              Meeting to Execution CRM
            </h1>
            <p className="text-xs sm:text-sm text-[#1a1a1a]/70 leading-relaxed">
              Convert raw meeting transcripts directly into structured project plans, task assignments, and verified delivery timelines with AI.
            </p>
          </div>

          {/* Demo Accounts List */}
          <div className="bg-white rounded-2xl border border-[#e7e9ed] p-5 shadow-clickup-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                1-Click Demo Accounts
              </h2>
              <span className="text-[11px] font-mono font-semibold text-[#ff6600]">Pass: Demo123!</span>
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
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#4617a8] bg-[#4617a8]/5 shadow-sm"
                        : "border-[#f0f2f5] bg-[#f8f9fb] hover:bg-[#ede7fe]/40 hover:border-[#4617a8]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${acc.badge}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          <span className="text-[10px] font-normal text-gray-500">({acc.label})</span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">{acc.note}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-[#4617a8]" : "text-gray-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-[#e7e9ed] p-8 shadow-clickup-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1a1a1a]">Sign In to Your Workspace</h2>
              <p className="text-xs text-gray-500 mt-1">
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
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@novaworks.example"
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#e7e9ed] focus:border-[#4617a8] focus:ring-2 focus:ring-[#4617a8]/20 outline-none transition-all text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1a1a] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Demo123!"
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#e7e9ed] focus:border-[#4617a8] focus:ring-2 focus:ring-[#4617a8]/20 outline-none transition-all font-mono text-[#1a1a1a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="genesis-btn-primary w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
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
