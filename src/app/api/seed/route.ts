import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_PASSWORD, DEMO_PROJECTS, DEMO_USERS } from "@/lib/data";

const clientIdForName = (name: string) =>
  `client-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export async function POST() {
  try {
    const supabase = createAdminClient();

    // 1. Seed Auth Users and Profiles
    for (const user of DEMO_USERS) {
      // Check if user already exists in auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === user.email.toLowerCase()
      );

      let authUserId = existingUser?.id;

      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { name: user.name, role: user.role },
        });

        if (createError) {
          console.error(`Error creating auth user ${user.email}:`, createError);
          continue;
        }
        authUserId = newUser.user.id;
      }

      if (authUserId) {
        await supabase.from("profiles").upsert({
          id: authUserId,
          demo_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
        }, { onConflict: "id" });
      }
    }

    // 2. Seed Clients
    const uniqueClientsMap = new Map<string, { id: string; name: string; managerId: string; manager: string }>();
    for (const p of DEMO_PROJECTS) {
      const name = p.client.trim();
      const id = clientIdForName(name);
      if (!uniqueClientsMap.has(id)) {
        uniqueClientsMap.set(id, {
          id,
          name,
          managerId: p.managerId,
          manager: p.manager,
        });
      }
    }

    for (const client of Array.from(uniqueClientsMap.values())) {
      await supabase.from("clients").upsert({
        id: client.id,
        name: client.name,
        manager_id: client.managerId,
        manager: client.manager,
        industry: "",
        representative_name: "",
        representative_phone: "",
      }, { onConflict: "id" });
    }

    // 3. Seed Projects & Tasks
    for (const project of DEMO_PROJECTS) {
      const clientId = clientIdForName(project.client);
      await supabase.from("projects").upsert({
        id: project.id,
        name: project.name,
        client: project.client,
        description: project.description,
        manager_id: project.managerId,
        manager: project.manager,
        deadline: project.deadline,
        closed: Boolean(project.closed),
      }, { onConflict: "id" });

      for (const task of project.tasks) {
        await supabase.from("tasks").upsert({
          id: task.id,
          project_id: project.id,
          client_id: clientId,
          title: task.title,
          description: task.description,
          assignee_id: task.assigneeId,
          assignee: task.assignee,
          deadline: task.deadline,
          estimated_hours: task.estimatedHours,
          completed: Boolean(task.completed),
        }, { onConflict: "id" });
      }
    }

    return NextResponse.json({ ok: true, message: "Database seeded successfully!" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seeding failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
