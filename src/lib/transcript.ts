import { prisma } from "./db";
import { AuthUser } from "./auth";
import { callGroqAI } from "./ai/groq";
import { DirectoryUser } from "./ai/prompt";
import { TranscriptOutputSchema, TranscriptOutput } from "./ai/schema";
import { validateTranscriptDraft, ValidationIssue } from "./validation";

// In-memory request lock to prevent concurrent/duplicate requests by the same admin
const processingUsers = new Set<string>();

export interface TranscriptCreationResult {
  success: boolean;
  statusCode: number;
  error?: string;
  issues?: ValidationIssue[];
  projects?: {
    id: string;
    name: string;
    clientName: string;
    managerId: string;
    deadline: string;
    taskCount: number;
  }[];
  totals?: {
    projects: number;
    tasks: number;
  };
}

export async function createFromTranscript(
  user: AuthUser,
  transcript: string
): Promise<TranscriptCreationResult> {
  // 1. Role verification
  if (user.role !== "ADMIN") {
    return {
      success: false,
      statusCode: 403,
      error: "Only administrators can create projects and tasks from a transcript",
    };
  }

  // 2. Reject empty/whitespace transcript
  if (!transcript || transcript.trim().length === 0) {
    return {
      success: false,
      statusCode: 400,
      error: "Transcript is empty. Please provide a meeting transcript.",
    };
  }

  // 3. Concurrency lock
  if (processingUsers.has(user.id)) {
    return {
      success: false,
      statusCode: 409,
      error: "A transcript is already being processed. Please wait for it to complete.",
    };
  }

  processingUsers.add(user.id);

  try {
    // 4. Fetch directory (NO emails, NO password hashes sent to AI)
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        specialization: true,
        skills: true,
      },
      orderBy: { id: "asc" },
    });

    const directory: DirectoryUser[] = dbUsers.map((u) => {
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

    // 5. Call AI
    let rawAiResult: unknown;
    try {
      rawAiResult = await callGroqAI(directory, transcript);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI service encountered an error";
      return {
        success: false,
        statusCode: 502,
        error: `AI service failed: ${msg}`,
      };
    }

    // 6. Zod Schema Validation
    const zodParsed = TranscriptOutputSchema.safeParse(rawAiResult);
    if (!zodParsed.success) {
      const issues: ValidationIssue[] = zodParsed.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return {
        success: false,
        statusCode: 422,
        error: "Draft has invalid data format",
        issues,
      };
    }

    const draft: TranscriptOutput = zodParsed.data;

    // 7. Business Logic Validation
    const validationResult = validateTranscriptDraft(draft, directory);
    if (!validationResult.valid) {
      return {
        success: false,
        statusCode: 422,
        error: "Draft has unresolved fields or business rule violations",
        issues: validationResult.issues,
      };
    }

    // 8. Atomic Database Transaction (All-or-nothing save)
    const createdProjects = await prisma.$transaction(async (tx) => {
      const savedProjects = [];

      for (const proj of draft.projects) {
        const createdProject = await tx.project.create({
          data: {
            name: proj.name.trim(),
            clientName: proj.clientName.trim(),
            description: proj.description?.trim() || "",
            managerId: proj.managerId!,
            deadline: proj.deadline,
            tasks: {
              create: proj.tasks.map((t) => ({
                title: t.title.trim(),
                description: t.description?.trim() || "",
                assigneeId: t.assigneeId!,
                deadline: t.deadline,
                estimatedHours: t.estimatedHours,
              })),
            },
          },
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        });

        savedProjects.push({
          id: createdProject.id,
          name: createdProject.name,
          clientName: createdProject.clientName,
          managerId: createdProject.managerId,
          deadline: createdProject.deadline,
          taskCount: createdProject._count.tasks,
        });
      }

      return savedProjects;
    });

    const totalTasks = createdProjects.reduce((acc, p) => acc + p.taskCount, 0);

    return {
      success: true,
      statusCode: 200,
      projects: createdProjects,
      totals: {
        projects: createdProjects.length,
        tasks: totalTasks,
      },
    };
  } finally {
    // Ensure the lock is ALWAYS released
    processingUsers.delete(user.id);
  }
}
