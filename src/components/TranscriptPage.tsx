"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "./AppProvider";
import { SAMPLE_TRANSCRIPT } from "@/lib/transcript";

export function TranscriptPage() {
  const { user, projects, addProjects } = useApp();
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ projects: typeof projects; source: string; message?: string } | null>(null);

  const process = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/transcript", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to process transcript.");
      addProjects(data.projects);
      setResult(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong."); }
    finally { setLoading(false); }
  };

  if (user?.role !== "ADMIN") return <div className="access-denied"><span>!</span><h1>Admin access required</h1><p>This workflow is available to administrators only.</p><Link href="/dashboard" className="primary-button">Return to projects</Link></div>;

  return (
    <div className="transcript-page">
      <section className="page-heading"><div><p className="eyebrow">AI-assisted setup</p><h1>Create projects from a transcript</h1><p>Paste a meeting transcript. The model will structure the agreed projects, tasks, owners, deadlines, and effort.</p></div></section>
      <div className="transcript-layout">
        <section className="editor-card"><div className="card-heading"><div><span className="step-number">01</span><h2>Meeting transcript</h2></div><button onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}>Load sample</button></div><textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste the complete meeting transcript here..." /><div className="editor-footer"><span>{transcript.trim().length} characters</span><button className="primary-button" onClick={process} disabled={loading || !transcript.trim()}>{loading ? <><span className="spinner" /> AI is reading the meeting...</> : "Create from transcript"}</button></div>{error && <div className="form-error">{error}</div>}</section>
        <aside className="how-it-works"><span className="step-number">02</span><h2>How it works</h2><ol><li><b>Paste</b><span>Copy the complete meeting discussion.</span></li><li><b>Extract</b><span>Grok identifies projects, tasks, owners, and dates.</span></li><li><b>Review</b><span>New work is added to your project workspace.</span></li></ol><div className="ai-note"><span>✦</span><p><strong>Grok-powered</strong>Configure GROK_API_KEY in Vercel environment variables to use your free Grok model.</p></div></aside>
      </div>
      {result && <section className="success-panel"><div className="success-icon">✓</div><div><p className="eyebrow">Creation complete</p><h2>{result.projects.length} projects and {result.projects.reduce((sum, project) => sum + project.tasks.length, 0)} tasks added</h2>{result.message && <p>{result.message}</p>}<div className="created-list">{result.projects.map((project) => <Link key={project.id} href={`/projects/${project.id}`}><strong>{project.name}</strong><span>{project.client} · {project.tasks.length} tasks →</span></Link>)}</div></div></section>}
    </div>
  );
}
