"use client";

import { FormEvent, useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloatingWorkspaceArt } from "./FloatingWorkspaceArt";
import type { Role } from "@/lib/types";

export function LoginPage() {
  const { user, login, signup } = useApp();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [email, setEmail] = useState("admin@genesis.example");
  const [password, setPassword] = useState(DEMO_PASSWORD);

  // Sign up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupRole, setSignupRole] = useState<Role>("AGENT");
  const [signupSpecialization, setSignupSpecialization] = useState("Full-stack Developer");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      router.replace("/dashboard");
    } else {
      setError(result.message ?? "Unable to sign in.");
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      specialization: signupSpecialization,
    });
    setLoading(false);

    if (result.ok) {
      if (result.message) {
        setSuccess(result.message);
        setMode("signin");
        setEmail(signupEmail);
        setPassword(signupPassword);
      } else {
        router.replace("/dashboard");
      }
    } else {
      setError(result.message ?? "Unable to create account.");
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setMode("signin");
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <FloatingWorkspaceArt />
        <h1>Turn meeting conversations into clear project plans.</h1>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="logo-row">
            <Image className="genesis-logo" src="/logo_main.png" alt="Genesis" width={335} height={110} priority />
          </div>

          <div key={`header-${mode}`} className="auth-title-animated">
            <p className="eyebrow">{mode === "signin" ? "Welcome back" : "Get started"}</p>
            <h2>{mode === "signin" ? "Sign in to workspace" : "Create new account"}</h2>
          </div>

          {/* Auth Tab Switcher with Animated Sliding Pill */}
          <div className={`auth-tabs ${mode === "signup" ? "is-signup" : ""}`} role="tablist">
            <span className="auth-tab-pill" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-tab ${mode === "signin" ? "is-active" : ""}`}
              onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab ${mode === "signup" ? "is-active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            >
              Create Account
            </button>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div className="form-success" style={{ marginBottom: 16 }}>{success}</div>}

          {mode === "signin" ? (
            <div key="signin-container" className="auth-form-animated">
              <form onSubmit={handleSignIn}>
                <label>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </label>
                <button className="primary-button" disabled={loading} style={{ marginTop: 6 }}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="demo-box">
                <div><strong>Quick demo login</strong><span>Choose any seeded role</span></div>
                <div className="demo-accounts">
                  {DEMO_USERS.slice(0, 3).map((item) => (
                    <button key={item.id} type="button" onClick={() => handleQuickLogin(item.email)}>
                      <span>{item.name}</span>
                      <small>{item.role}</small>
                    </button>
                  ))}
                </div>
                <p>Password: <b>{DEMO_PASSWORD}</b></p>
              </div>
            </div>
          ) : (
            <div key="signup-container" className="auth-form-animated">
              <form onSubmit={handleSignUp}>
                <label>
                  Full name
                  <input
                    type="text"
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    placeholder="e.g. Maya Lin"
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    placeholder="maya@example.com"
                    required
                  />
                </label>

                <div className="form-row">
                  <label>
                    Workspace role
                    <select
                      value={signupRole}
                      onChange={(event) => {
                        const nextRole = event.target.value as Role;
                        setSignupRole(nextRole);
                        if (nextRole === "ADMIN") setSignupSpecialization("Administrator");
                        else if (nextRole === "MANAGER") setSignupSpecialization("Project Manager");
                        else setSignupSpecialization("Full-stack Developer");
                      }}
                    >
                      <option value="AGENT">Agent / Dev</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </label>

                  <label>
                    Specialization / Title
                    <input
                      type="text"
                      value={signupSpecialization}
                      onChange={(event) => setSignupSpecialization(event.target.value)}
                      placeholder="e.g. AI Engineer"
                      required
                    />
                  </label>
                </div>

                <label>
                  Password
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </label>

                <label>
                  Confirm password
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(event) => setSignupConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </label>

                <button className="primary-button" disabled={loading} style={{ marginTop: 6 }}>
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
            </div>
          )}

          <p className="login-note">Powered by Supabase Auth & PostgreSQL</p>
        </div>
      </section>
    </main>
  );
}
