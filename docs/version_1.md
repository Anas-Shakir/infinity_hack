# AGENTS.md: AI Project Manager (Meeting to Execution)

> Context file for the AI coding agent. Read this ENTIRE file before writing any code.
> Hackathon: **The Infinity Hack '26**. Build time: **3 hours**. Team: 4 humans.
> Goal: a working local demo. Prioritize a **working meeting-to-project flow** and a **clear frontend** over polish.

---

## 1. Project Summary

Build a simple Project Management CRM for a fictional company, **NovaWorks Technologies** (Lahore, Pakistan).

Core flow:

```
Login -> Admin pastes meeting transcript -> AI (Groq) extracts projects + tasks
      -> validation -> saved in DB (transaction) -> view projects/tasks by role
```

The company has **10 demo accounts**: 1 administrator, 3 project managers, 6 developer agents. There is **no signup**, no forgot password, no email verification, and no user-management screen. Users are created by a **seed script**.

The meeting transcript is converted into **3 projects and 12 tasks** by the AI. A prefilled/hardcoded answer is NOT acceptable. The result must really come from the AI call, because judges will test a modified transcript.

---

## 2. Scope

### In scope (must build)
1. Login / logout using the seeded demo accounts.
2. Admin home: all project cards + **Create from Transcript** button.
3. Read-only team directory (names, roles, specializations).
4. Projects list + project detail (client, manager, deadline, tasks).
5. Task rows: title, description, assigned agent, deadline, estimated hours.
6. Manager view (only their projects). Agent "My Tasks" view (only their tasks).
7. Persistent storage (local DB; data survives refresh and restart).
8. AI transcript conversion with loading state, success result, and understandable errors.
9. Role-based access enforced **on the server** (API/data layer), not only in the UI.

### Out of scope (DO NOT build)
- Signup, forgot password, email verification, user management screens
- Cost calculation, hourly rates, budgets
- Progress monitoring, completion percentages, charts, timesheets
- Sending emails or any external messaging
- Editing projects/tasks (optional only if everything else is done and tested)

---

## 3. Tech Stack (decided)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Frontend + API route handlers in one project |
| UI | **Tailwind CSS** | Simple, clean, responsive. No heavy component library needed |
| Database | **SQLite (local file)** via **Prisma** | Zero setup. Must stay easy to swap to PostgreSQL later (see section 17) |
| ORM | **Prisma** | Schema, migrations, seed, `$transaction` |
| Auth | **Custom cookie session**: `bcryptjs` for hashing, `jose` for a signed JWT stored in an **httpOnly** cookie | No external auth service |
| AI | **Groq API** via `groq-sdk` | Default model `llama-3.3-70b-versatile` (configurable by env). JSON mode, `temperature: 0` |
| Validation | **Zod** | Validate the AI output shape AND request bodies |
| Seeding | `tsx prisma/seed.ts` | Idempotent upsert by email |
| Package manager | npm | Keep commands simple |

Do not add extra frameworks (no Redux, no tRPC, no NextAuth). Keep dependencies minimal.

---

## 4. Roles and Privileges

Three roles, hardcoded as an enum. No permission tables.

| Role | Projects visible | Tasks visible | Special actions |
|---|---|---|---|
| `ADMIN` | All | All | **Only role allowed to use transcript creation** |
| `MANAGER` | Only where `project.managerId == currentUser.id` | All tasks in their projects | none |
| `AGENT` | Only distinct projects that contain tasks assigned to them | **Only tasks assigned to them** (never other agents' tasks) | none |

Rules:
- The current user is ALWAYS derived from the **session cookie**. NEVER trust a role or user ID sent by the client (body, query, header).
- An agent MAY see the related project name, client, manager, deadline. An agent MUST NOT see other agents' tasks.
- Requests for a project outside the user's scope return **404** (do not reveal existence).
- Passwords/hashes are NEVER returned by any API and NEVER sent to the AI.

---

## 5. Folder Structure

```
/
├─ AGENTS.md                      # this file
├─ README.md                      # required for judging (see section 16)
├─ .env.example
├─ .env                           # local, git-ignored
├─ package.json
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ dev.db                      # SQLite file (git-ignored)
├─ data/
│  └─ sample-transcript.txt       # the supplied NovaWorks transcript (provided by the humans)
├─ src/
│  ├─ middleware.ts               # redirects unauthenticated users to /login
│  ├─ lib/
│  │  ├─ db.ts                    # Prisma client singleton
│  │  ├─ auth.ts                  # hash/verify, sign/verify session, getCurrentUser()
│  │  ├─ access.ts                # role-based data access (SINGLE source of truth)
│  │  ├─ ai/
│  │  │  ├─ groq.ts               # Groq client + call wrapper
│  │  │  ├─ prompt.ts             # system prompt builder
│  │  │  └─ schema.ts             # Zod schemas for AI output
│  │  ├─ transcript.ts            # createFromTranscript() pipeline
│  │  └─ validation.ts            # business-rule validation of the draft
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                 # role-based home (redirect/dispatch)
│  │  ├─ login/page.tsx
│  │  ├─ projects/page.tsx
│  │  ├─ projects/[id]/page.tsx
│  │  ├─ my-tasks/page.tsx        # agent view
│  │  ├─ team/page.tsx
│  │  ├─ transcript/page.tsx      # admin only
│  │  └─ api/
│  │     ├─ auth/login/route.ts
│  │     ├─ auth/logout/route.ts
│  │     ├─ auth/me/route.ts
│  │     ├─ team/route.ts
│  │     ├─ projects/route.ts
│  │     ├─ projects/[id]/route.ts
│  │     ├─ my-tasks/route.ts
│  │     └─ transcript/create/route.ts
│  └─ components/
│     ├─ Navbar.tsx
│     ├─ ProjectCard.tsx
│     ├─ TaskTable.tsx
│     ├─ TeamTable.tsx
│     ├─ TranscriptForm.tsx
│     └─ ErrorList.tsx
└─ tests/ (optional)
   └─ access.test.ts, transcript.test.ts
```

---

## 6. Environment Variables

`.env.example` (placeholders only; never commit real keys):

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string-min-32-chars"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"
```

- `SESSION_SECRET` is used to sign the session JWT.
- Add `.env`, `prisma/*.db`, `node_modules`, `.next` to `.gitignore`.

---

## 7. Data Model (Prisma)

Three entities: **User**, **Project**, **Task**.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id            // fixed seed IDs: ADMIN, PM01..PM03, DEV01..DEV06
  name           String
  email          String    @unique
  passwordHash   String
  role           String                   // "ADMIN" | "MANAGER" | "AGENT"
  specialization String
  skills         String                   // JSON array string (SQLite has no scalar lists)
  managedProjects Project[] @relation("ProjectManager")
  assignedTasks   Task[]    @relation("TaskAssignee")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  clientName  String
  description String   @default("")
  managerId   String
  manager     User     @relation("ProjectManager", fields: [managerId], references: [id])
  deadline    String                      // YYYY-MM-DD
  tasks       Task[]
  createdAt   DateTime @default(now())
}

model Task {
  id             String  @id @default(cuid())
  projectId      String
  project        Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title          String
  description    String  @default("")
  assigneeId     String
  assignee       User    @relation("TaskAssignee", fields: [assigneeId], references: [id])
  deadline       String                   // YYYY-MM-DD
  estimatedHours Float
  createdAt      DateTime @default(now())
}
```

Notes:
- Use string `YYYY-MM-DD` for dates (simple, sortable, no timezone issues).
- Parse `skills` with `JSON.parse` when returning to the client (return as `string[]`).
- Project and Task IDs are **generated by the application/DB**, never by the AI. The AI only returns existing user IDs.
- Application-level checks (not DB constraints) enforce: `managerId` references a `MANAGER`, `assigneeId` references an `AGENT`.

---

## 8. Seed Data (10 demo accounts)

All passwords: `Demo123!` (hash with bcrypt before storing). Seed is **idempotent**: upsert by unique email, re-running must NOT duplicate users.

| ID | Name | Email | Role | Specialization | Skills |
|---|---|---|---|---|---|
| ADMIN | Admin | admin@novaworks.example | ADMIN | Administrator | Company overview, transcript creation |
| PM01 | Ayesha Khan | ayesha@novaworks.example | MANAGER | Manager / Web PM | Web projects, client coordination |
| PM02 | Bilal Ahmed | bilal@novaworks.example | MANAGER | Manager / Mobile PM | Mobile projects, delivery planning |
| PM03 | Hina Malik | hina@novaworks.example | MANAGER | Manager / AI PM | AI projects, requirement review |
| DEV01 | Ali Raza | ali@novaworks.example | AGENT | Agent / Full-Stack | React, frontend integration |
| DEV02 | Hamza Shah | hamza@novaworks.example | AGENT | Agent / Full-Stack | Node.js, databases, APIs |
| DEV03 | Sara Noor | sara@novaworks.example | AGENT | Agent / App Developer | Flutter, mobile UI |
| DEV04 | Usman Tariq | usman@novaworks.example | AGENT | Agent / App Developer | Flutter, integration, testing |
| DEV05 | Zain Abbas | zain@novaworks.example | AGENT | Agent / AI Developer | LLMs, extraction, prompts |
| DEV06 | Maryam Asif | maryam@novaworks.example | AGENT | Agent / AI Developer | Retrieval, document processing |

Seed command: `npm run seed` (script: `tsx prisma/seed.ts`).

---

## 9. Authentication

- `POST /api/auth/login` body `{ email, password }`:
  1. Find user by email. If missing or `bcrypt.compare` fails, return `401 { error: "Invalid email or password" }` (same message for both cases).
  2. Sign a JWT (`jose`, HS256, `SESSION_SECRET`) containing only `{ userId }`, expiry ~8h.
  3. Set cookie `session`: `httpOnly`, `sameSite: "lax"`, `path: "/"`, `secure` only in production.
  4. Return `{ user: { id, name, role, email } }`.
- `POST /api/auth/logout`: clear the cookie.
- `GET /api/auth/me`: return the current user or `401`.
- `getCurrentUser()` in `lib/auth.ts`: read cookie, verify JWT, **load user from DB by `userId`** (so role always comes from the DB, never from the token body or the client).
- `middleware.ts`: redirect unauthenticated page requests to `/login`. API routes still perform their own auth checks (never rely on middleware alone).
- Post-login redirect: ADMIN -> `/` (admin home), MANAGER -> `/projects`, AGENT -> `/my-tasks`.

---

## 10. Authorization Layer (`lib/access.ts`)

ALL data access for projects/tasks MUST go through these functions. Every API route and server component uses them. No route may query projects/tasks directly.

```ts
getProjects(user):
  ADMIN   -> all projects (with manager + task count)
  MANAGER -> projects where managerId == user.id
  AGENT   -> distinct projects containing tasks where assigneeId == user.id

getTasks(user, projectId):
  ADMIN   -> all tasks in projectId
  MANAGER -> all tasks only if they manage projectId, else []
  AGENT   -> only tasks where assigneeId == user.id in projectId

getProjectById(user, projectId):
  if project not in getProjects(user) -> return null  (route returns 404)
  else return project (+manager) with getTasks(user, projectId)

getMyTasks(user):   // AGENT
  tasks where assigneeId == user.id, including project name/client/manager
```

Requirements:
- Always include `manager { id, name }` and `assignee { id, name }` in returned data (never password hashes; use `select`).
- Verify scope in the DB query itself where possible (`where` clauses), not by filtering after fetching everything.

---

## 11. API Specification

All routes return JSON. All except login require a valid session (else `401`).

| Method | Route | Allowed | Description |
|---|---|---|---|
| POST | `/api/auth/login` | public | Login |
| POST | `/api/auth/logout` | any | Logout |
| GET | `/api/auth/me` | any | Current user |
| GET | `/api/team` | any | All users: `id, name, role, specialization, skills[]` (no email required, never hash) |
| GET | `/api/projects` | any | Projects visible to the role, each with `manager`, `taskCount` |
| GET | `/api/projects/:id` | any | Project + visible tasks. `404` if out of scope |
| GET | `/api/my-tasks` | AGENT | Agent's tasks with project info. Non-agents get `403` |
| POST | `/api/transcript/create` | **ADMIN only** | AI conversion + save. Non-admin gets `403` |

### `POST /api/transcript/create`

Request: `{ "transcript": "string" }`

Responses:
- `200`: `{ "projects": [ { id, name, clientName, managerId, deadline, taskCount } ], "totals": { projects: 3, tasks: 12 } }`
- `400`: `{ "error": "Transcript is empty" }`
- `403`: `{ "error": "Only administrators can create from a transcript" }`
- `422`: `{ "error": "Draft has unresolved fields", "issues": [ { "path": "projects[1].tasks[3].assigneeId", "message": "Assignee DEV99 is not an existing agent" } ] }` and **nothing is saved**
- `502`: `{ "error": "AI service failed. Please try again." }` (Groq error, timeout, or unparseable JSON after retry) and **nothing is saved**

---

## 12. AI Transcript Pipeline (the core feature)

File: `lib/transcript.ts` -> `createFromTranscript(user, transcript)`

```
1. Reject unless user.role === "ADMIN"
2. Reject empty/whitespace transcript (400)
3. directory = all users -> [{ id, name, role, specialization, skills }]
   (NO email, NO passwordHash)
4. draft = callGroq(transcript, directory)       // JSON mode, temperature 0
5. Parse JSON (strip code fences if present). On parse failure retry ONCE, then 502
6. Zod-validate the shape
7. Business validation (collect ALL issues, don't stop at first):
   For each project:
     - name, clientName non-empty
     - deadline valid date YYYY-MM-DD
     - managerId exists AND role === MANAGER
     For each task:
       - title non-empty
       - assigneeId exists AND role === AGENT
       - estimatedHours is a number > 0
       - deadline valid date YYYY-MM-DD
       - task.deadline <= project.deadline
   Also: at least one project returned.
8. If any issue -> 422 with issues list, SAVE NOTHING
9. Else prisma.$transaction: create each project with nested tasks (IDs generated by DB/app)
10. Return created projects with task counts
```

### AI output shape (strict)

```json
{
  "projects": [
    {
      "name": "string",
      "clientName": "string",
      "description": "string",
      "managerId": "PM01",
      "deadline": "2026-10-20",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "assigneeId": "DEV01",
          "deadline": "2026-10-12",
          "estimatedHours": 12
        }
      ]
    }
  ]
}
```

The model returns **task content + existing user IDs only**. The app generates project/task IDs.

### Groq call settings (`lib/ai/groq.ts`)

```ts
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const completion = await groq.chat.completions.create({
  model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  temperature: 0,
  response_format: { type: "json_object" },   // the prompt MUST contain the word "JSON"
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }      // directory + transcript
  ],
});
const raw = completion.choices[0]?.message?.content ?? "";
```

- Add a request timeout (~60s) and catch rate-limit (429) errors with a friendly message ("AI is busy, wait a few seconds and retry").
- Groq free tier has tokens-per-minute limits. The full transcript is about 5-6k tokens, so it should fit, but do not retry in a tight loop.
- If the model supports strict `json_schema` output, it may be used. Otherwise JSON mode + Zod is the fallback and is sufficient.

### System prompt (`lib/ai/prompt.ts`): use this content

```
You are an assistant that converts a meeting transcript into structured project data
for a project-management CRM. Respond with ONLY a single valid JSON object, no markdown,
no commentary.

You are given:
1. A DIRECTORY of existing company users (id, name, role, specialization, skills).
2. A meeting TRANSCRIPT.

Rules:
- Use ONLY user IDs that exist in the DIRECTORY. Never invent a person or an ID.
  managerId must be a user with role MANAGER. assigneeId must be a user with role AGENT.
- Match people mentioned by first name to the directory (e.g. "Ayesha" -> her ID).
- People mentioned who are NOT in the directory (e.g. clients or outside contacts) are
  not employees: never assign work to them and never add them.
- Follow the FINAL agreed decisions. When something is changed later in the meeting
  (deadline, hours, owner), use the LAST agreed value and discard the earlier one.
  A final recap near the end of the meeting is authoritative.
- IGNORE rejected, excluded, or "future work" features. Do not create tasks for them
  (for example payments, inventory integration, live maps, driver tracking, sending
  emails, separate native Android and iOS tasks).
- Keep separate tasks separate, even when the same person owns them. Do not merge tasks.
  Do not split a task into smaller ones unless the meeting explicitly did.
- Create one project per client engagement as stated in the meeting. Do not combine projects.
- estimatedHours is developer EFFORT in hours as agreed in the meeting, not the number
  of days until the deadline. Do not create management-hour tasks.
- All dates are in 2026 and must be formatted YYYY-MM-DD.
- Task titles must use the names agreed in the meeting.
- Each project description should concisely state the agreed scope, including important
  exclusions (e.g. "demo cart only, no real payments or inventory integration").
- Each task description should briefly state what the task covers, as discussed.
- If a required value truly cannot be determined from the transcript, still return your
  best structured output but use null for that field (do not guess a person).

Output JSON shape:
{
  "projects": [
    {
      "name": string,
      "clientName": string,
      "description": string,
      "managerId": string,
      "deadline": "YYYY-MM-DD",
      "tasks": [
        {
          "title": string,
          "description": string,
          "assigneeId": string,
          "deadline": "YYYY-MM-DD",
          "estimatedHours": number
        }
      ]
    }
  ]
}
```

User message format:

```
DIRECTORY:
<JSON array of directory entries>

TRANSCRIPT:
<full transcript text>
```

Null handling: if the model returns `null` for a required field, Zod/business validation will flag it and the admin sees the unresolved-fields message. That is the intended "request a correction" behavior.

### Duplicate / double-click protection
- Disable the Create button while the request is in flight (client side).
- On the server, keep an in-memory lock (e.g., a module-level `Set` keyed by user ID) so a second concurrent request from the same admin returns `409 { error: "A transcript is already being processed" }`. Always release the lock in `finally`.

### All-or-nothing save
- Use `prisma.$transaction(async (tx) => { ... })`. If anything throws, nothing is persisted. AI failure or invalid output must never leave partial projects.

---

## 13. Screens (Frontend)

Use Tailwind. Clean, readable, responsive. Role badge in the navbar.

### Navbar (all logged-in pages)
- App name "NovaWorks PM", the current user's name + role badge, **Logout**.
- Links by role:
  - ADMIN: Home, Projects, Team, Create from Transcript
  - MANAGER: My Projects, Team
  - AGENT: My Tasks, Team

### 1. `/login`
- Email + password, Login button, error message on invalid credentials.
- A small "Demo accounts" box listing a few accounts (admin, a manager, an agent) with password `Demo123!`; clicking an account fills the form. (Hardcoded demo credentials are allowed.)

### 2. Admin Home `/`
- Heading "All Projects", grid of **ProjectCard** (name, client, manager name, deadline, task count).
- Prominent **Create from Transcript** button -> `/transcript`.
- Empty state: "No projects yet. Create some from a meeting transcript."

### 3. Create from Transcript `/transcript` (ADMIN only; others redirected/403)
- Large textarea (paste area) and a **"Load sample transcript"** button (fills in the supplied transcript text; the user can still edit it).
- **Create from Transcript** button:
  - On click: disabled + spinner + text "AI is reading the meeting...".
  - Success: green box "Created 3 projects and 12 tasks" + list of created projects with task counts + links to each project.
  - 422: red **ErrorList** of unresolved fields ("Task 'X': assignee not found"), textarea content preserved so the admin can fix and resubmit; nothing saved.
  - 502/network: friendly error + retry.

### 4. Projects list `/projects`
- ADMIN: all. MANAGER: only theirs ("My Projects"). AGENT: projects they have tasks in.
- Cards as above, click opens detail.

### 5. Project detail `/projects/[id]`
- Header: project name, client, manager, deadline, description.
- **TaskTable** columns: Title, Description, Assigned agent, Deadline, Est. hours.
- Agents see only their own task rows. Out-of-scope project -> "Not found" page.
- Do NOT show cost, progress, or charts. (A simple total-hours line is optional.)

### 6. My Tasks `/my-tasks` (AGENT)
- Tasks grouped by project: project name + client + manager, then task rows (title, description, deadline, hours).
- Empty state if none.

### 7. Team directory `/team`
- Read-only table: Name, Role, Specialization (skills optional). No emails or edit controls.

### UX details
- Loading skeleton/spinner for data fetches; clear error and empty states everywhere.
- Server components may call `lib/access.ts` directly (still going through the access layer). Client components call the API.

---

## 14. Suggested Build Order (3 hours, parallelizable)

1. **(0:00-0:20)** `create-next-app`, Tailwind, Prisma schema, `.env`, `npm run seed`. Verify 10 users exist.
2. **(0:20-0:50)** Auth: login/logout/me, session cookie, middleware, Navbar, login page.
3. **(0:50-1:20)** `lib/access.ts` + read APIs + project list/detail/my-tasks/team pages.
4. **(in parallel, 0:20-1:30)** AI pipeline: prompt, Groq call, Zod schema, business validation, transaction save. Test it with a script against `data/sample-transcript.txt` before building UI.
5. **(1:30-2:15)** Transcript page UI: loading, success, error list, sample loader, lock.
6. **(2:15-2:45)** Full test pass (section 15), fix bugs, polish.
7. **(2:45-3:00)** README, `.env.example`, demo video checklist.

If time is tight, cut: edit features, extra styling, tests. Never cut: server-side role checks, validation, transaction.

---

## 15. Acceptance Tests (must pass)

### Expected result from the supplied transcript: 3 projects, 12 tasks

| Project | Manager | Deadline | Tasks | Hours |
|---|---|---|---|---|
| UrbanCart Website (client: UrbanCart Clothing) | PM01 Ayesha | 2026-10-20 | 4 | 40 |
| QuickServe Mobile App (client: QuickServe Services) | PM02 Bilal | 2026-10-24 | 4 | 46 |
| HelpDeskPro AI Assistant (client: HelpDeskPro Solutions) | PM03 Hina | 2026-10-22 | 4 | 38 |

| Project / Task | Owner | Deadline | Hours |
|---|---|---|---|
| UrbanCart / Product catalog UI | DEV01 Ali | 2026-10-12 | 12 |
| UrbanCart / Demo cart UI | DEV01 Ali | 2026-10-15 | 8 |
| UrbanCart / Product and cart APIs | DEV02 Hamza | 2026-10-14 | 14 |
| UrbanCart / Website integration and testing | DEV01 Ali | 2026-10-19 | 6 |
| QuickServe / Login and profile screens | DEV03 Sara | 2026-10-12 | 8 |
| QuickServe / Service booking screens | DEV03 Sara | 2026-10-17 | 12 |
| QuickServe / Booking and account APIs | DEV02 Hamza | 2026-10-16 | 16 |
| QuickServe / Mobile integration and testing | DEV04 Usman | 2026-10-22 | 10 |
| HelpDeskPro / FAQ document processing | DEV06 Maryam | 2026-10-13 | 10 |
| HelpDeskPro / Assistant answer generation | DEV05 Zain | 2026-10-17 | 14 |
| HelpDeskPro / Human escalation flow | DEV05 Zain | 2026-10-18 | 6 |
| HelpDeskPro / Assistant evaluation and testing | DEV06 Maryam | 2026-10-21 | 8 |

### Traps the AI must handle (the transcript contains corrections)
- UrbanCart deadline is **2026-10-20** (not 10-18). Its integration task is due **10-19** (not 10-17).
- QuickServe integration is **10 hours** (not 8).
- HelpDeskPro "Assistant evaluation and testing" owner is **Maryam** (not Zain).
- "Kamran" is NOT an employee: never added, never assigned work.
- NO tasks for: payment gateway, inventory integration, live maps, driver tracking, email sending, separate Android/iOS apps, management-hour estimates.
- Hamza's two API tasks stay as **two separate tasks** (14h and 16h). Ali's two frontend tasks stay separate.

### Changed-input test (judges will do this)
Change QuickServe integration to **12 hours and 2026-10-23** in the transcript (both in the discussion and final recap). Only that task must change; everything else stays identical.

### Access tests
- Admin sees all 3 projects and the transcript option.
- Ayesha (PM01) sees ONLY UrbanCart.
- Ali (DEV01) sees exactly **3 tasks** (Product catalog UI, Demo cart UI, Website integration and testing) and the related project UrbanCart; he does not see Hamza's tasks inside it.
- Hamza (DEV02) sees **2 tasks** across UrbanCart and QuickServe.
- As an agent/manager, `GET /api/projects/<id of a project you are not in>` returns 404.
- As non-admin, `POST /api/transcript/create` returns 403.
- Unauthenticated requests to any API return 401.
- Data persists after browser refresh and server restart.
- Re-running `npm run seed` does not create duplicate users.
- Double-clicking Create does not create duplicate projects.
- Empty transcript shows a clear error. An invalid AI result saves nothing.

---

## 16. README.md Requirements (judges read this)

Create a root `README.md` containing:
- Project / team name
- Stack
- Working features
- Exact setup and run commands (clone, `npm install`, copy `.env.example` to `.env`, `npx prisma migrate dev`, `npm run seed`, `npm run dev`)
- Database setup and seed command
- Environment variable names
- Demo emails and passwords (fictional, may be listed)
- Transcript testing steps (including the changed-input test)
- Demo video link (local DB submission) and live link if deployed
- Deployment platform, DB provider, and deployment steps (if deployed)
- Known limitations

Never put real API keys or DB passwords in the README or repo.

---

## 17. Later: Optional Deployment (extra marks, do ONLY after the local demo works)

- Switch `datasource db` provider to `postgresql` and set `DATABASE_URL` to a hosted Postgres (Aiven free tier: https://aiven.io/free-postgresql-database).
- Change `skills` to `String[]` (Postgres supports scalar lists) or keep the JSON string to avoid code changes.
- Re-run `prisma migrate` and the seed against the hosted DB.
- Deploy the Next.js app (e.g., Vercel), set env vars `DATABASE_URL`, `SESSION_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL` in the host's dashboard, set cookie `secure: true` in production.
- Note: the in-memory request lock works per server instance; that is fine for the demo.

---

## 18. Working Rules for the AI Agent

1. Read this file fully. Follow the decided stack. Do not substitute libraries.
2. Build incrementally and keep the app runnable after each step (`npm run dev` must work).
3. After each major step, run it (seed, login, API call) to verify before moving on.
4. **Security non-negotiables:** session-derived identity, server-side role checks via `lib/access.ts`, no password hashes in any response, no passwords/emails sent to the AI.
5. **Never hardcode the transcript's answer.** The projects/tasks must come from the Groq call.
6. Save nothing on invalid/failed AI output. Use one transaction.
7. Keep code simple, typed, and commented where logic is non-obvious. No over-engineering.
8. Do not create files outside the structure above without reason. Do not commit secrets.
9. When something is ambiguous, choose the simplest option consistent with this document and note the assumption in the README under "Known limitations" or a comment.
10. Provide short progress summaries after each milestone, including the exact commands the humans should run to test it.

---

## 19. Reference: Company Scenario Notes

- Company: NovaWorks Technologies, Lahore, Pakistan (websites, mobile apps, AI tools for clients).
- Meeting: "NovaWorks Client Delivery Planning", 7 October 2026, 09:00-10:00 Asia/Karachi. All deadlines are in 2026.
- Participants: Ayesha, Bilal, Hina (managers); Ali, Hamza, Sara, Usman, Zain, Maryam (developers).
- The supplied transcript has timestamped segments covering: opening and workflow, UrbanCart scope and tasks (with a delivery-date correction), QuickServe scope and tasks (with an hours correction), HelpDeskPro scope and tasks (with an owner correction and an outsider "Kamran"), account setup discussion, CRM flow discussion, and a final recap that is authoritative. The full text is placed by the humans in `data/sample-transcript.txt`; use the **entire** transcript as AI input.
- Fictional data only: all names, emails and dialogue are fictional.
