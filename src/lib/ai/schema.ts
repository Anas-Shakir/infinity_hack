import { z } from "zod";

export const TaskDraftSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().default(""),
  assigneeId: z.string().nullable().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Task deadline must be YYYY-MM-DD"),
  estimatedHours: z.number().positive("Estimated hours must be a positive number"),
});

export const ProjectDraftSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientName: z.string().min(1, "Client name is required"),
  description: z.string().default(""),
  managerId: z.string().nullable().optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Project deadline must be YYYY-MM-DD"),
  tasks: z.array(TaskDraftSchema).min(1, "Project must contain at least one task"),
});

export const TranscriptOutputSchema = z.object({
  projects: z.array(ProjectDraftSchema).min(1, "Transcript must contain at least one project"),
});

export type TaskDraft = z.infer<typeof TaskDraftSchema>;
export type ProjectDraft = z.infer<typeof ProjectDraftSchema>;
export type TranscriptOutput = z.infer<typeof TranscriptOutputSchema>;
