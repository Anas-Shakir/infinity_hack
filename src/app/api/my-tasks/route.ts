import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMyTasks } from "@/lib/access";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "AGENT") {
    return NextResponse.json(
      { error: "Access denied. Only agents can access personal task lists." },
      { status: 403 }
    );
  }

  const tasks = await getMyTasks(currentUser);
  return NextResponse.json({ tasks });
}
