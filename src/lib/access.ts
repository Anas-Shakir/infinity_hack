import { prisma } from "./db";
import { AuthUser } from "./auth";

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  description: string;
  deadline: string;
  managerId: string;
  manager: {
    id: string;
    name: string;
    role: string;
    specialization: string;
  };
  taskCount: number;
  createdAt: Date;
}

export interface TaskDetail {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  assignee: {
    id: string;
    name: string;
    role: string;
    specialization: string;
  };
  deadline: string;
  estimatedHours: number;
  createdAt: Date;
  project?: {
    id: string;
    name: string;
    clientName: string;
    deadline: string;
    manager: {
      id: string;
      name: string;
    };
  };
}

export interface ProjectDetail extends ProjectSummary {
  tasks: TaskDetail[];
}

/**
 * Single source of truth for role-based project querying.
 */
export async function getProjects(user: AuthUser): Promise<ProjectSummary[]> {
  let whereClause = {};

  if (user.role === "ADMIN") {
    whereClause = {};
  } else if (user.role === "MANAGER") {
    whereClause = { managerId: user.id };
  } else if (user.role === "AGENT") {
    whereClause = {
      tasks: {
        some: {
          assigneeId: user.id,
        },
      },
    };
  } else {
    return [];
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      clientName: true,
      description: true,
      deadline: true,
      managerId: true,
      createdAt: true,
      manager: {
        select: {
          id: true,
          name: true,
          role: true,
          specialization: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      deadline: "asc",
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    description: p.description,
    deadline: p.deadline,
    managerId: p.managerId,
    manager: p.manager,
    taskCount: p._count.tasks,
    createdAt: p.createdAt,
  }));
}

/**
 * Single source of truth for role-based task querying within a project.
 */
export async function getTasks(user: AuthUser, projectId: string): Promise<TaskDetail[]> {
  if (user.role === "ADMIN") {
    return prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        assigneeId: true,
        deadline: true,
        estimatedHours: true,
        createdAt: true,
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });
  }

  if (user.role === "MANAGER") {
    const project = await prisma.project.findFirst({
      where: { id: projectId, managerId: user.id },
      select: { id: true },
    });
    if (!project) {
      return [];
    }
    return prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        assigneeId: true,
        deadline: true,
        estimatedHours: true,
        createdAt: true,
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });
  }

  if (user.role === "AGENT") {
    return prisma.task.findMany({
      where: { projectId, assigneeId: user.id },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        assigneeId: true,
        deadline: true,
        estimatedHours: true,
        createdAt: true,
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });
  }

  return [];
}

/**
 * Fetch project by ID strictly honoring the user's role and visibility.
 * Returns null if the user does not have permission to view the project.
 */
export async function getProjectById(user: AuthUser, projectId: string): Promise<ProjectDetail | null> {
  // First verify if the project is in the user's permitted project list
  const allowedProjects = await getProjects(user);
  const matched = allowedProjects.find((p) => p.id === projectId);
  if (!matched) {
    return null;
  }

  const tasks = await getTasks(user, projectId);

  return {
    ...matched,
    tasks,
  };
}

/**
 * Fetch all tasks assigned to the agent across all projects.
 */
export async function getMyTasks(user: AuthUser): Promise<TaskDetail[]> {
  if (user.role !== "AGENT") {
    return [];
  }

  return prisma.task.findMany({
    where: {
      assigneeId: user.id,
    },
    select: {
      id: true,
      projectId: true,
      title: true,
      description: true,
      assigneeId: true,
      deadline: true,
      estimatedHours: true,
      createdAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          role: true,
          specialization: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          clientName: true,
          deadline: true,
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { project: { name: "asc" } },
      { deadline: "asc" },
    ],
  });
}
