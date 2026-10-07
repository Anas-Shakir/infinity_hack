import { AppShell } from "@/components/AppShell";
import { ProjectDetail } from "@/components/ProjectDetail";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ProjectDetail id={id} /></AppShell>;
}
