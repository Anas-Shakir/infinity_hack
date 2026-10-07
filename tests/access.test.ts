import { prisma } from "../src/lib/db";
import { getProjects, getTasks, getProjectById, getMyTasks } from "../src/lib/access";
import { AuthUser, verifyPassword } from "../src/lib/auth";

async function runAccessTests() {
  console.log("--- Starting RBAC & Access Layer Verification Tests ---");

  // 1. Verify 10 users in DB
  const users = await prisma.user.findMany();
  console.log(`✓ Total users in database: ${users.length} (Expected: 10)`);
  if (users.length !== 10) throw new Error("Expected exactly 10 seeded users");

  // 2. Verify password verification
  const adminUser = users.find((u) => u.id === "ADMIN")!;
  const isValidPass = await verifyPassword("Demo123!", adminUser.passwordHash);
  console.log(`✓ Admin password verification with Demo123!: ${isValidPass}`);
  if (!isValidPass) throw new Error("Admin password verification failed");

  // Create a mock project with 2 tasks for testing data access
  console.log("Setting up mock test project and tasks in DB...");
  const testProject = await prisma.project.create({
    data: {
      id: "test-urban-cart",
      name: "UrbanCart Website",
      clientName: "UrbanCart Clothing",
      description: "Demo test project",
      managerId: "PM01", // Ayesha
      deadline: "2026-10-20",
      tasks: {
        create: [
          {
            id: "task-ali-1",
            title: "Product catalog UI",
            assigneeId: "DEV01", // Ali
            deadline: "2026-10-12",
            estimatedHours: 12,
          },
          {
            id: "task-hamza-1",
            title: "Product and cart APIs",
            assigneeId: "DEV02", // Hamza
            deadline: "2026-10-14",
            estimatedHours: 14,
          },
        ],
      },
    },
  });

  const adminAuth: AuthUser = {
    id: "ADMIN",
    name: "Admin",
    email: "admin@novaworks.example",
    role: "ADMIN",
    specialization: "Administrator",
    skills: [],
  };

  const ayeshaAuth: AuthUser = {
    id: "PM01",
    name: "Ayesha Khan",
    email: "ayesha@novaworks.example",
    role: "MANAGER",
    specialization: "Manager / Web PM",
    skills: [],
  };

  const bilalAuth: AuthUser = {
    id: "PM02",
    name: "Bilal Ahmed",
    email: "bilal@novaworks.example",
    role: "MANAGER",
    specialization: "Manager / Mobile PM",
    skills: [],
  };

  const aliAuth: AuthUser = {
    id: "DEV01",
    name: "Ali Raza",
    email: "ali@novaworks.example",
    role: "AGENT",
    specialization: "Agent / Full-Stack",
    skills: [],
  };

  const hamzaAuth: AuthUser = {
    id: "DEV02",
    name: "Hamza Shah",
    email: "hamza@novaworks.example",
    role: "AGENT",
    specialization: "Agent / Full-Stack",
    skills: [],
  };

  // 3. Admin access checks
  const adminProjects = await getProjects(adminAuth);
  console.log(`✓ Admin sees all projects: ${adminProjects.length} projects`);
  if (adminProjects.length < 1) throw new Error("Admin should see at least 1 project");

  const adminTasks = await getTasks(adminAuth, "test-urban-cart");
  console.log(`✓ Admin sees all tasks: ${adminTasks.length} tasks (Expected: 2)`);
  if (adminTasks.length !== 2) throw new Error("Admin should see all 2 tasks");

  // 4. Manager access checks
  const ayeshaProjects = await getProjects(ayeshaAuth);
  console.log(`✓ Manager Ayesha sees her project: ${ayeshaProjects.length} projects`);
  if (ayeshaProjects.length !== 1 || ayeshaProjects[0].id !== "test-urban-cart") {
    throw new Error("Ayesha should see her project");
  }

  const bilalProjects = await getProjects(bilalAuth);
  console.log(`✓ Manager Bilal (unrelated) sees 0 projects: ${bilalProjects.length} projects`);
  if (bilalProjects.length !== 0) throw new Error("Bilal should see 0 projects");

  const bilalProjectView = await getProjectById(bilalAuth, "test-urban-cart");
  console.log(`✓ Manager Bilal getProjectById returned: ${bilalProjectView} (Expected: null)`);
  if (bilalProjectView !== null) throw new Error("Bilal should not be able to get Ayesha's project");

  // 5. Agent task isolation checks
  const aliProjectView = await getProjectById(aliAuth, "test-urban-cart");
  console.log(`✓ Agent Ali project tasks count: ${aliProjectView?.tasks.length} (Expected: 1, only Ali's task)`);
  if (aliProjectView?.tasks.length !== 1 || aliProjectView.tasks[0].id !== "task-ali-1") {
    throw new Error("Ali must only see his own task, not Hamza's task!");
  }

  const hamzaProjectView = await getProjectById(hamzaAuth, "test-urban-cart");
  console.log(`✓ Agent Hamza project tasks count: ${hamzaProjectView?.tasks.length} (Expected: 1, only Hamza's task)`);
  if (hamzaProjectView?.tasks.length !== 1 || hamzaProjectView.tasks[0].id !== "task-hamza-1") {
    throw new Error("Hamza must only see his own task, not Ali's task!");
  }

  const aliMyTasks = await getMyTasks(aliAuth);
  console.log(`✓ Agent Ali getMyTasks returned: ${aliMyTasks.length} tasks`);
  if (aliMyTasks.length !== 1 || aliMyTasks[0].id !== "task-ali-1") {
    throw new Error("Ali getMyTasks mismatch");
  }

  // Clean up mock test project
  await prisma.task.deleteMany({ where: { projectId: "test-urban-cart" } });
  await prisma.project.delete({ where: { id: "test-urban-cart" } });
  console.log("✓ Cleaned up test mock data.");

  console.log("--- ALL ACCESS LAYER TESTS PASSED SUCCESSFULLY! ---\n");
}

runAccessTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
