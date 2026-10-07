import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      specialization: true,
      skills: true,
    },
    orderBy: { id: "asc" },
  });

  const formattedUsers = users.map((u) => {
    let skills: string[] = [];
    try {
      skills = JSON.parse(u.skills);
    } catch {
      skills = [];
    }
    return {
      id: u.id,
      name: u.name,
      role: u.role,
      specialization: u.specialization,
      skills,
    };
  });

  return NextResponse.json({ users: formattedUsers });
}
