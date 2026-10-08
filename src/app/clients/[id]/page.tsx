import { AppShell } from "@/components/AppShell";
import { ClientDetail } from "@/components/ClientDetail";

export default async function ClientRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ClientDetail id={id} /></AppShell>;
}
