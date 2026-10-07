export type Role = "ADMIN" | "MANAGER" | "AGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assignee: string;
  deadline: string;
  estimatedHours: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  managerId: string;
  manager: string;
  deadline: string;
  tasks: Task[];
}
