import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only administrators can reset demo data" },
      { status: 403 }
    );
  }

  try {
    // Delete all tasks and projects in a transaction (users are kept intact)
    await prisma.$transaction([
      prisma.task.deleteMany({}),
      prisma.project.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: "All projects and tasks have been reset. Seeded users preserved.",
    });
  } catch (err) {
    console.error("Reset error:", err);
    return NextResponse.json({ error: "Failed to reset data" }, { status: 500 });
  }
}
