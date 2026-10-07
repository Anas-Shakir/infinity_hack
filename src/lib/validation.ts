import { TranscriptOutput } from "./ai/schema";
import { DirectoryUser } from "./ai/prompt";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

/**
 * Validates the draft against directory users, role constraints, date logic, and business rules.
 * Collects ALL issues without stopping at the first one.
 */
export function validateTranscriptDraft(
  draft: TranscriptOutput,
  directory: DirectoryUser[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const userMap = new Map<string, DirectoryUser>();
  directory.forEach((u) => userMap.set(u.id, u));

  if (!draft.projects || draft.projects.length === 0) {
    issues.push({
      path: "projects",
      message: "At least one project must be returned from the transcript",
    });
    return { valid: false, issues };
  }

  draft.projects.forEach((proj, pIdx) => {
    const pPath = `projects[${pIdx}]`;

    if (!proj.name || proj.name.trim().length === 0) {
      issues.push({ path: `${pPath}.name`, message: "Project name cannot be empty" });
    }

    if (!proj.clientName || proj.clientName.trim().length === 0) {
      issues.push({ path: `${pPath}.clientName`, message: "Client name cannot be empty" });
    }

    if (!proj.deadline || !isValidDateString(proj.deadline)) {
      issues.push({
        path: `${pPath}.deadline`,
        message: `Project deadline '${proj.deadline}' is not a valid YYYY-MM-DD date`,
      });
    }

    if (!proj.managerId) {
      issues.push({
        path: `${pPath}.managerId`,
        message: `Project '${proj.name || pIdx}' requires an assigned manager ID`,
      });
    } else {
      const manager = userMap.get(proj.managerId);
      if (!manager) {
        issues.push({
          path: `${pPath}.managerId`,
          message: `Manager ID '${proj.managerId}' does not exist in the employee directory`,
        });
      } else if (manager.role !== "MANAGER") {
        issues.push({
          path: `${pPath}.managerId`,
          message: `User '${manager.name}' (${proj.managerId}) is a ${manager.role}, not a MANAGER`,
        });
      }
    }

    if (!proj.tasks || proj.tasks.length === 0) {
      issues.push({
        path: `${pPath}.tasks`,
        message: `Project '${proj.name || pIdx}' must contain at least one task`,
      });
    } else {
      proj.tasks.forEach((task, tIdx) => {
        const tPath = `${pPath}.tasks[${tIdx}]`;

        if (!task.title || task.title.trim().length === 0) {
          issues.push({ path: `${tPath}.title`, message: "Task title cannot be empty" });
        }

        if (typeof task.estimatedHours !== "number" || task.estimatedHours <= 0) {
          issues.push({
            path: `${tPath}.estimatedHours`,
            message: `Task '${task.title || tIdx}' must have estimated hours greater than 0`,
          });
        }

        if (!task.deadline || !isValidDateString(task.deadline)) {
          issues.push({
            path: `${tPath}.deadline`,
            message: `Task deadline '${task.deadline}' is not a valid YYYY-MM-DD date`,
          });
        } else if (proj.deadline && isValidDateString(proj.deadline)) {
          if (task.deadline > proj.deadline) {
            issues.push({
              path: `${tPath}.deadline`,
              message: `Task deadline (${task.deadline}) cannot be after project deadline (${proj.deadline})`,
            });
          }
        }

        if (!task.assigneeId) {
          issues.push({
            path: `${tPath}.assigneeId`,
            message: `Task '${task.title || tIdx}' requires an assigned developer/agent ID`,
          });
        } else {
          const assignee = userMap.get(task.assigneeId);
          if (!assignee) {
            issues.push({
              path: `${tPath}.assigneeId`,
              message: `Assignee ID '${task.assigneeId}' does not exist in the employee directory`,
            });
          } else if (assignee.role !== "AGENT") {
            issues.push({
              path: `${tPath}.assigneeId`,
              message: `User '${assignee.name}' (${task.assigneeId}) is a ${assignee.role}, not an AGENT`,
            });
          }
        }
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
