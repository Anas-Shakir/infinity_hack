import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/access";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getProjects(currentUser);
  return NextResponse.json({ projects });
}
