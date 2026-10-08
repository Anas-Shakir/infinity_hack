import { DEMO_PROJECTS, DEMO_USERS } from "./data";
import type { Project } from "./types";

export const SAMPLE_TRANSCRIPT = `Genesis Client Delivery Planning — 7 October 2026

UrbanCart Clothing: The team agreed to build a product catalog website and a demo cart. The final scope is a product catalog UI, demo cart UI, product and cart APIs, and website integration and testing. The client wants the site ready by October 20. The deadline was initially October 18, but the final agreed deadline is October 20. Ali will own the frontend work, Hamza will own the APIs, and Ali will own integration and testing. The final scope excludes real payments and inventory integration.

QuickServe Services: We will build a mobile app for service booking. Sara will own the login and profile screens and the service booking screens. Hamza will build the booking and account APIs. Usman will own mobile integration and testing. The final deadline is October 24. The mobile integration task was discussed as 8 hours, but the final agreed estimate is 10 hours. No separate iOS and Android projects are required.

HelpDeskPro Solutions: The AI assistant will process FAQ documents, generate answers, have a human escalation flow, and evaluate the assistant. Maryam will own FAQ processing and evaluation, while Zain will own answer generation and escalation. The final deadline is October 22. Kamran is a client contact and will not be assigned work. We will not build payment gateways, live maps, driver tracking, email sending, or inventory integration.

Final recap: UrbanCart is October 20, QuickServe is October 24, and HelpDeskPro is October 22. UrbanCart frontend tasks are October 12 and October 15, API task is October 14, and integration is October 19. QuickServe frontend tasks are October 12 and October 17, API is October 16, and integration is October 22. HelpDeskPro tasks are October 13, October 17, October 18, and October 21. The exact project and task names are final.`;

export interface TranscriptResult {
  projects: Project[];
  source: "groq" | "fallback";
  message?: string;
}

interface GroqProject {
  name: string;
  clientName: string;
  description: string;
  managerId: string;
  deadline: string;
  tasks: Array<{ title: string; description: string; assigneeId: string; deadline: string; estimatedHours: number }>;
}

interface GroqResponse { projects: GroqProject[] }

function normalize(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function findUser(name: unknown) {
  if (typeof name !== "string" || !name.trim()) return undefined;
  const normalized = normalize(name);
  return DEMO_USERS.find((user) => normalize(user.name) === normalized || normalize(user.name.split(" ")[0]) === normalized);
}

function parseGroqResponse(raw: string): GroqResponse {
  const parsed: unknown = JSON.parse(raw.replace(/^```json|```$/gi, "").trim());
  if (typeof parsed !== "object" || parsed === null || !("projects" in parsed) || !Array.isArray(parsed.projects)) {
    throw new Error("Groq returned an invalid response: expected a projects array.");
  }
  for (const [projectIndex, project] of parsed.projects.entries()) {
    if (typeof project !== "object" || project === null) {
      throw new Error(`Groq returned an invalid project at position ${projectIndex + 1}.`);
    }
    const candidate = project as Record<string, unknown>;
    for (const field of ["name", "clientName", "description", "managerId", "deadline"] as const) {
      if (typeof candidate[field] !== "string" || !candidate[field].trim()) {
        throw new Error(`Groq omitted "${field}" for project ${projectIndex + 1}. Check the model response format.`);
      }
    }
    if (!Array.isArray(candidate.tasks)) {
      throw new Error(`Groq omitted the tasks list for project ${projectIndex + 1}. Check the model response format.`);
    }
    for (const [taskIndex, task] of candidate.tasks.entries()) {
      if (typeof task !== "object" || task === null) {
        throw new Error(`Groq returned an invalid task at position ${taskIndex + 1} in project ${projectIndex + 1}.`);
      }
      const taskCandidate = task as Record<string, unknown>;
      for (const field of ["title", "description", "assigneeId", "deadline"] as const) {
        if (typeof taskCandidate[field] !== "string" || !taskCandidate[field].trim()) {
          throw new Error(`Groq omitted "${field}" for task ${taskIndex + 1} in project ${projectIndex + 1}. Check the model response format.`);
        }
      }
      if (typeof taskCandidate.estimatedHours !== "number" || !Number.isFinite(taskCandidate.estimatedHours)) {
        throw new Error(`Groq returned an invalid estimatedHours for task ${taskIndex + 1} in project ${projectIndex + 1}.`);
      }
    }
  }
  return parsed as GroqResponse;
}

function fallbackFromTranscript(transcript: string): Project[] {
  const cleaned = transcript.toLowerCase();
  if (!cleaned.includes("urbancart") || !cleaned.includes("quickserve") || !cleaned.includes("helpdeskpro")) {
    return [];
  }
  return DEMO_PROJECTS.map((project) => ({ ...project, tasks: project.tasks.map((task) => ({ ...task })) }));
}

async function callGroq(transcript: string): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY ?? process.env.GROK_API_KEY;
  const model = process.env.GROQ_MODEL ?? process.env.GROK_MODEL ?? "llama-3.3-70b-versatile";
  if (!apiKey) throw new Error("Groq API key is not configured. Set GROQ_API_KEY in .env.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You extract structured project delivery data from a meeting transcript. Return only valid JSON with a projects array. Use exactly the supplied employee IDs, never invent people. Assign only existing employees. Use final decisions, ignore rejected work, and do not create separate platform tasks. Every project must have name, clientName, description, managerId, deadline, and tasks. Every task must have title, description, assigneeId, deadline, estimatedHours. Dates must be YYYY-MM-DD. Do not include comments or markdown.` },
        { role: "user", content: `DIRECTORY: ${JSON.stringify(DEMO_USERS.map(({ id, name, role, specialization }) => ({ id, name, role, specialization })))}` },
        { role: "user", content: `TRANSCRIPT:\n${transcript}` },
      ],
    }),
  });

  if (!response.ok) {
    let providerMessage = "";
    try {
      const payload = await response.json() as { error?: { message?: string } };
      providerMessage = payload.error?.message ?? "";
    } catch {
      providerMessage = "";
    }
    if (response.status === 400 || response.status === 404) {
      throw new Error(`Groq rejected the model or request (HTTP ${response.status})${providerMessage ? `: ${providerMessage}` : ". Check GROQ_MODEL and the request format."}`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Groq rejected the API key (HTTP ${response.status}). Check GROQ_API_KEY in .env.`);
    }
    if (response.status === 429) {
      throw new Error(`The Groq account has reached its rate or usage limit${providerMessage ? `: ${providerMessage}` : ". Check your Groq account limits and try again."}`);
    }
    throw new Error(`The Groq service returned HTTP ${response.status}${providerMessage ? `: ${providerMessage}` : ". Try again later."}`);
  }
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq returned no content");
  return parseGroqResponse(raw);
}

export async function extractTranscript(transcript: string): Promise<TranscriptResult> {
  if (!transcript.trim()) throw new Error("Paste a meeting transcript first.");
  try {
    const result = await callGroq(transcript);
    const projects = result.projects.map((project, index) => ({
      id: `generated-${index}-${Date.now()}`,
      name: project.name,
      client: project.clientName,
      description: project.description,
      managerId: project.managerId,
      manager: findUser(project.managerId)?.name ?? project.managerId,
      deadline: project.deadline,
      tasks: project.tasks.map((task, taskIndex) => ({
        id: `generated-task-${index}-${taskIndex}-${Date.now()}`,
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        assignee: findUser(task.assigneeId)?.name ?? task.assigneeId,
        deadline: task.deadline,
        estimatedHours: Number(task.estimatedHours),
      })),
    }));
    if (!projects.length) throw new Error("Groq did not return any projects.");
    return { projects, source: "groq" };
  } catch (error) {
    const projects = fallbackFromTranscript(transcript);
    if (projects.length) {
      console.warn("Groq could not process the sample transcript; using demo projects.", error);
      return { projects, source: "fallback", message: "Groq was unavailable, so the demo transcript was used." };
    }
    console.error("Transcript extraction failed.", error);
    if (error instanceof Error) throw error;
    throw new Error("Transcript extraction failed for an unknown reason.");
  }
}
