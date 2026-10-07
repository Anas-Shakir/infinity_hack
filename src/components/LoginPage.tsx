"use client";

import { FormEvent, useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/data";
import { useRouter } from "next/navigation";

export function LoginPage() {
  const { user, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("admin@novaworks.example");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = login(email, password);
    setLoading(false);
    if (result.ok) router.replace("/dashboard");
    else setError(result.message ?? "Unable to sign in.");
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand-mark">N</div>
        <p className="eyebrow">Delivery intelligence, simplified</p>
        <h1>Turn meeting conversations into clear project plans.</h1>
        <p className="visual-copy">A focused workspace for project managers to turn client conversations into actionable delivery work.</p>
        <div className="visual-stat"><strong>3</strong><span>projects<br />12 tasks</span></div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="logo-row"><div className="brand-mark small">N</div><strong>NovaWorks <em>PM</em></strong></div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
          <form onSubmit={submit}>
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <div className="form-error">{error}</div>}
            <button className="primary-button" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </form>
          <div className="demo-box">
            <div><strong>Demo access</strong><span>Use any seeded account</span></div>
            <div className="demo-accounts">{DEMO_USERS.slice(0, 3).map((item) => <button key={item.id} onClick={() => { setEmail(item.email); setPassword(DEMO_PASSWORD); }}><span>{item.name}</span><small>{item.role}</small></button>)}</div>
            <p>Password: <b>{DEMO_PASSWORD}</b></p>
          </div>
          <p className="login-note">Demo login only. No authentication service is connected.</p>
        </div>
      </section>
    </main>
  );
}
