import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo123!";

const DEMO_USERS = [
  { id: "ADMIN", name: "Admin", email: "admin@genesis.example", role: "ADMIN", specialization: "Administrator" },
  { id: "PM01", name: "Ayesha Khan", email: "ayesha@genesis.example", role: "MANAGER", specialization: "Web Project Manager" },
  { id: "PM02", name: "Bilal Ahmed", email: "bilal@genesis.example", role: "MANAGER", specialization: "Mobile Project Manager" },
  { id: "PM03", name: "Hina Malik", email: "hina@genesis.example", role: "MANAGER", specialization: "AI Project Manager" },
  { id: "DEV01", name: "Ali Raza", email: "ali@genesis.example", role: "AGENT", specialization: "Full-stack Developer" },
  { id: "DEV02", name: "Hamza Shah", email: "hamza@genesis.example", role: "AGENT", specialization: "Backend Developer" },
  { id: "DEV03", name: "Sara Noor", email: "sara@genesis.example", role: "AGENT", specialization: "Mobile Developer" },
  { id: "DEV04", name: "Usman Tariq", email: "usman@genesis.example", role: "AGENT", specialization: "Mobile Developer" },
  { id: "DEV05", name: "Zain Abbas", email: "zain@genesis.example", role: "AGENT", specialization: "AI Developer" },
  { id: "DEV06", name: "Maryam Asif", email: "maryam@genesis.example", role: "AGENT", specialization: "AI Developer" },
];

const DEMO_PROJECTS = [
  {
    id: "project-urban-cart",
    name: "UrbanCart Website",
    client: "UrbanCart Clothing",
    description: "A production-ready product catalog and demo cart. No real payments or inventory integration.",
    managerId: "PM01",
    manager: "Ayesha Khan",
    deadline: "2026-10-20",
    tasks: [
      { id: "task-uc-1", title: "Product catalog UI", description: "Build the responsive product catalog and filtering experience.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-12", estimatedHours: 12 },
      { id: "task-uc-2", title: "Demo cart UI", description: "Create the customer-facing demo cart interactions.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-15", estimatedHours: 8 },
      { id: "task-uc-3", title: "Product and cart APIs", description: "Create APIs for catalog data and demo cart operations.", assigneeId: "DEV02", assignee: "Hamza Shah", deadline: "2026-10-14", estimatedHours: 14 },
      { id: "task-uc-4", title: "Website integration and testing", description: "Integrate the frontend with the APIs and complete quality checks.", assigneeId: "DEV01", assignee: "Ali Raza", deadline: "2026-10-19", estimatedHours: 6 },
    ],
  },
  {
    id: "project-quick-serve",
    name: "QuickServe Mobile App",
    client: "QuickServe Services",
    description: "A mobile service booking experience for customers.",
    managerId: "PM02",
    manager: "Bilal Ahmed",
    deadline: "2026-10-24",
    tasks: [
      { id: "task-qs-1", title: "Login and profile screens", description: "Build the authentication and customer profile screens.", assigneeId: "DEV03", assignee: "Sara Noor", deadline: "2026-10-12", estimatedHours: 8 },
      { id: "task-qs-2", title: "Service booking screens", description: "Build the service selection and booking workflow.", assigneeId: "DEV03", assignee: "Sara Noor", deadline: "2026-10-17", estimatedHours: 12 },
      { id: "task-qs-3", title: "Booking and account APIs", description: "Create APIs for booking and account management.", assigneeId: "DEV02", assignee: "Hamza Shah", deadline: "2026-10-16", estimatedHours: 16 },
      { id: "task-qs-4", title: "Mobile integration and testing", description: "Connect the mobile screens and complete integration testing.", assigneeId: "DEV04", assignee: "Usman Tariq", deadline: "2026-10-22", estimatedHours: 10 },
    ],
  },
  {
    id: "project-helpdesk",
    name: "HelpDeskPro AI Assistant",
    client: "HelpDeskPro Solutions",
    description: "An AI assistant for FAQ document processing and human escalation.",
    managerId: "PM03",
    manager: "Hina Malik",
    deadline: "2026-10-22",
    tasks: [
      { id: "task-hd-1", title: "FAQ document processing", description: "Build ingestion and preparation for customer support documents.", assigneeId: "DEV06", assignee: "Maryam Asif", deadline: "2026-10-13", estimatedHours: 10 },
      { id: "task-hd-2", title: "Assistant answer generation", description: "Build answer generation from approved FAQ documents.", assigneeId: "DEV05", assignee: "Zain Abbas", deadline: "2026-10-17", estimatedHours: 14 },
      { id: "task-hd-3", title: "Human escalation flow", description: "Create a clear workflow for handing off unresolved requests.", assigneeId: "DEV05", assignee: "Zain Abbas", deadline: "2026-10-18", estimatedHours: 6 },
      { id: "task-hd-4", title: "Assistant evaluation and testing", description: "Evaluate responses and run end-to-end quality checks.", assigneeId: "DEV06", assignee: "Maryam Asif", deadline: "2026-10-21", estimatedHours: 8 },
    ],
  },
];

const clientIdForName = (name) =>
  `client-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

async function runSeed() {
  console.log("🌱 Starting Supabase Seeding...");

  // 1. Auth Users & Profiles
  console.log("👤 Creating/verifying Auth Users & Profiles...");
  const { data: existingUsersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list existing auth users:", listError.message);
    process.exit(1);
  }
  const existingUsers = existingUsersData.users || [];

  for (const user of DEMO_USERS) {
    let existingUser = existingUsers.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    let authUserId = existingUser?.id;

    if (!existingUser) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role },
      });
      if (createError) {
        console.error(`❌ Error creating auth user ${user.email}:`, createError.message);
        continue;
      }
      authUserId = created.user.id;
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    } else {
      console.log(`  ℹ User already exists: ${user.name} (${user.email})`);
    }

    if (authUserId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authUserId,
        demo_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
      }, { onConflict: "id" });

      if (profileError) {
        console.error(`  ❌ Error saving profile for ${user.name}:`, profileError.message);
      }
    }
  }

  // 2. Clients
  console.log("🏢 Seeding Clients...");
  const uniqueClientsMap = new Map();
  for (const p of DEMO_PROJECTS) {
    const name = p.client.trim();
    const id = clientIdForName(name);
    if (!uniqueClientsMap.has(id)) {
      uniqueClientsMap.set(id, {
        id,
        name,
        manager_id: p.managerId,
        manager: p.manager,
        industry: name.includes("Clothing") ? "E-Commerce / Fashion" : name.includes("Services") ? "Home Services" : "B2B SaaS",
        representative_name: "",
        representative_phone: "",
      });
    }
  }

  for (const client of uniqueClientsMap.values()) {
    const { error: clientError } = await supabase.from("clients").upsert(client, { onConflict: "id" });
    if (clientError) {
      console.error(`❌ Error seeding client ${client.name}:`, clientError.message);
    } else {
      console.log(`  ✓ Seeded client: ${client.name}`);
    }
  }

  // 3. Projects & Tasks
  console.log("📁 Seeding Projects & Tasks...");
  for (const project of DEMO_PROJECTS) {
    const clientId = clientIdForName(project.client);
    const { error: projectError } = await supabase.from("projects").upsert({
      id: project.id,
      name: project.name,
      client: project.client,
      description: project.description,
      manager_id: project.managerId,
      manager: project.manager,
      deadline: project.deadline,
      closed: Boolean(project.closed),
    }, { onConflict: "id" });

    if (projectError) {
      console.error(`❌ Error seeding project ${project.name}:`, projectError.message);
      continue;
    }
    console.log(`  ✓ Seeded project: ${project.name}`);

    for (const task of project.tasks) {
      const { error: taskError } = await supabase.from("tasks").upsert({
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

      if (taskError) {
        console.error(`    ❌ Error seeding task ${task.title}:`, taskError.message);
      } else {
        console.log(`    ✓ Task: ${task.title} (${task.assignee})`);
      }
    }
  }

  console.log("\n🎉 All demo data and users seeded successfully in Supabase!");
}

runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
