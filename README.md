# GENESIS PM - AI Meeting to Project CRM

> AI-powered Project Management CRM for NovaWorks Technologies that automates the conversion of raw meeting transcripts into structured client projects, manager assignments, and developer task allocations with strict role-based access control.

## Team
- **Team name**: GENESIS
- **Responsibilities**:
  - Member 1: AI Prompt Engineering & Groq Pipeline Integration
  - Member 2: Backend Architecture, Auth (JWT/Bcrypt) & RBAC Access Layer
  - Member 3: Next.js Frontend Components & Dynamic Role UI & GUI
- **Repository**: https://github.com/Anas-Shakir/infinity_hack

## What Works
- **Seeded Demo Accounts**: 10 pre-configured accounts (1 Administrator, 3 Project Managers, 6 Developer Agents) with idempotent seeder script (`npm run seed`).
- **Authentication & Role-Based Session**: Custom secure JWT in `httpOnly` cookie with password verification using `bcryptjs` and token signing via `jose`.
- **AI Transcript Automation (Admin Exclusive)**: Integration with Groq (`llama-3.3-70b-versatile`) in JSON mode (`temperature: 0`) to extract projects and tasks from unstructured meeting minutes.
- **Strict Business & Schema Validation**:
  - Zod validation for AI schema integrity.
  - Multi-pass business rule validation: employee existence, role checks (manager vs agent), deadline sanity (`task.deadline <= project.deadline`), positive effort hours.
  - Returns structured `422` with exact paths for invalid drafts without persisting partial records.
- **Atomic Persistence**: Uses `prisma.$transaction` ensuring all-or-nothing database writes.
- **In-Memory Concurrency Lock**: Prevents duplicate submissions and race conditions during AI processing.
- **Role-Based Views & Data Isolation**:
  - **Admin**: Views all projects, full team directory, and has exclusive access to the AI Transcript creation suite.
  - **Manager**: Sees only projects assigned under their management.
  - **Agent**: Sees only tasks assigned directly to their account, grouped by project, with zero access to tasks assigned to other agents.
  - **Data Layer Security (`lib/access.ts`)**: Server-side permission enforcement returning `404` for unauthorized project queries.
- **Data Reset**: Built-in reset utility to clear demo projects/tasks between judge evaluations without deleting seeded users.

## Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons
- **Backend**: Next.js Server Route Handlers + Server Actions + `lib/access.ts` RBAC Layer
- **Database**: SQLite via Prisma ORM (`prisma/dev.db`) — zero-setup local file database with seamless PostgreSQL compatibility
- **AI Engine**: Groq API (`groq-sdk`) running `llama-3.3-70b-versatile` (JSON mode, temperature 0)
- **Auth**: Custom session cookies (`httpOnly`, `sameSite: "lax"`), `jose` (JWT), and `bcryptjs`

## Links
- **Live application**: [URL or Not deployed]
- **Demo video**: [Accessible Recording URL]

## Requirements
- **Node.js**: `v18.17+` or `v20+` (tested on Node v24)
- **Package Manager**: `npm`
- **Groq API Key**: Free API key from [Groq Console](https://console.groq.com)

## Run Locally

1. **Clone this repository and enter its directory**:
   ```sh
   git clone https://github.com/Anas-Shakir/infinity_hack
   cd infinity_hack
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```sh
   cp .env.example .env
   ```
   Edit `.env` and set your `GROQ_API_KEY`:
   ```env
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="novaworks-infinity-hack-super-secure-secret-key-32-chars-minimum"
   GROQ_API_KEY="your-groq-api-key-here"
   GROQ_MODEL="llama-3.3-70b-versatile"
   ```

4. **Initialize the database schema**:
   ```sh
   npx prisma db push
   ```

5. **Seed the 10 demo user accounts**:
   ```sh
   npm run seed
   ```
   *(Note: The seeder is idempotent. Re-running will not duplicate accounts.)*

6. **Start the development server**:
   ```sh
   npm run dev
   ```

7. **Open the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Purpose | Where configured |
| --- | --- | --- |
| `DATABASE_URL` | SQLite / PostgreSQL connection URI | Backend (`.env`) |
| `SESSION_SECRET` | Secret key for signing session JWTs | Backend (`.env`) |
| `GROQ_API_KEY` | Groq API credential for AI extraction | Backend (`.env`) |
| `GROQ_MODEL` | AI Model ID (defaults to `llama-3.3-70b-versatile`) | Backend (`.env`) |

*All secrets and keys are restricted to the server environment and are never exposed to the client bundle.*

---

## Demo Login Accounts

All accounts are pre-seeded with the password: **`Demo123!`**

| Role | Name | Demo Email | Specialization | Skills |
| --- | --- | --- | --- | --- |
| **Admin** | Admin | `admin@novaworks.example` | Administrator | Company overview, transcript creation |
| **Manager** | Ayesha Khan | `ayesha@novaworks.example` | Manager / Web PM | Web projects, client coordination |
| **Manager** | Bilal Ahmed | `bilal@novaworks.example` | Manager / Mobile PM | Mobile projects, delivery planning |
| **Manager** | Hina Malik | `hina@novaworks.example` | Manager / AI PM | AI projects, requirement review |
| **Agent** | Ali Raza | `ali@novaworks.example` | Agent / Full-Stack | React, frontend integration |
| **Agent** | Hamza Shah | `hamza@novaworks.example` | Agent / Full-Stack | Node.js, databases, APIs |
| **Agent** | Sara Noor | `sara@novaworks.example` | Agent / App Developer | Flutter, mobile UI |
| **Agent** | Usman Tariq | `usman@novaworks.example` | Agent / App Developer | Flutter, integration, testing |
| **Agent** | Zain Abbas | `zain@novaworks.example` | Agent / AI Developer | LLMs, extraction, prompts |
| **Agent** | Maryam Asif | `maryam@novaworks.example` | Agent / AI Developer | Retrieval, document processing |

*Tip: The login page includes a one-click demo account selector to quickly fill credentials.*

---

## How Judges Can Test

### 1. Test Seeded Login & Navigation
- Go to [http://localhost:3000/login](http://localhost:3000/login).
- Select or enter `admin@novaworks.example` with password `Demo123!`.
- Verify successful login and redirect to the Admin Home overview.

### 2. Test AI Meeting Transcript Conversion
- Navigate to **"Create from Transcript"** in the top navigation or banner.
- Click the **"Load Sample Transcript"** button to load the full 60-minute NovaWorks meeting minutes from `data/sample-transcript.txt`.
- Click **"Create from Transcript"**.
- Expect **3 projects** and **12 tasks** created:
  1. **UrbanCart Website** (Client: UrbanCart Clothing, Manager: Ayesha Khan, Deadline: 2026-10-20, 4 tasks, 40 hrs total):
     - Product catalog UI (Ali Raza, 2026-10-12, 12h)
     - Demo cart UI (Ali Raza, 2026-10-15, 8h)
     - Product and cart APIs (Hamza Shah, 2026-10-14, 14h)
     - Website integration and testing (Ali Raza, 2026-10-19, 6h)
  2. **QuickServe Mobile App** (Client: QuickServe Services, Manager: Bilal Ahmed, Deadline: 2026-10-24, 4 tasks, 46 hrs total):
     - Login and profile screens (Sara Noor, 2026-10-12, 8h)
     - Service booking screens (Sara Noor, 2026-10-17, 12h)
     - Booking and account APIs (Hamza Shah, 2026-10-16, 16h)
     - Mobile integration and testing (Usman Tariq, 2026-10-22, 10h)
  3. **HelpDeskPro AI Assistant** (Client: HelpDeskPro Solutions, Manager: Hina Malik, Deadline: 2026-10-22, 4 tasks, 38 hrs total):
     - FAQ document processing (Maryam Asif, 2026-10-13, 10h)
     - Assistant answer generation (Zain Abbas, 2026-10-17, 14h)
     - Human escalation flow (Zain Abbas, 2026-10-18, 6h)
     - Assistant evaluation and testing (Maryam Asif, 2026-10-21, 8h)

### 3. Verify AI Transcript Correction & Scope Traps
- Verify that discarded scope items (payment gateway, live maps, driver tracking, email integration) were **ignored** by the AI.
- Verify that outside contact "Kamran" was **not** assigned or added.
- Verify that the revised UrbanCart deadline (20 Oct instead of 18 Oct) and revised integration task deadline (19 Oct instead of 17 Oct) were correctly extracted.
- Verify that Maryam was assigned as the final owner of HelpDeskPro testing (replacing Zain).

### 4. Test Role-Based Access Isolation
- **Manager Isolation**: Log out and log in as **Ayesha Khan** (`ayesha@novaworks.example`).
  - Verify that only **UrbanCart Website** appears on `/projects`.
  - Attempting to directly open `/projects/<QuickServe_ID>` yields a `404 Not Found`.
- **Agent Task Isolation**: Log out and log in as **Ali Raza** (`ali@novaworks.example`).
  - Redirected to `/my-tasks`.
  - Only his **3 assigned UrbanCart tasks** appear.
  - Opening the UrbanCart project view shows only his own 3 tasks (Hamza's API task is hidden).
- **Multi-Project Agent**: Log in as **Hamza Shah** (`hamza@novaworks.example`).
  - His **2 API tasks** across UrbanCart (14h) and QuickServe (16h) appear grouped under their respective projects.
- **Unauthorized Actions**: Non-admin users cannot access `/transcript` or call `/api/transcript/create` (returns `403 Forbidden`).

### 5. Test Changed Input Dynamic AI Extraction
- Log in as admin, click **"Reset Data"** in the top navbar (or click "Load Sample Transcript" on `/transcript`).
- Modify the transcript in the textarea:
  - Change QuickServe Mobile integration estimate to **12 hours** and deadline to **2026-10-23** (in both the discussion and recap).
- Click **"Create from Transcript"**.
- Confirm that the QuickServe Mobile integration task updates dynamically to **12 hours** and **2026-10-23**, while other tasks remain unchanged.

### 6. Persistence & Reset Testing
- Refresh the browser or restart the Next.js server — all saved records persist.
- Use the **"Reset Data"** button in the Admin navbar to reset projects and tasks for subsequent test runs without deleting seeded users.

---

## Deployment Details
- **Deployment status**: Local Demo & PostgreSQL-Ready
- **Frontend / Backend**: Next.js App Router
- **Database**: SQLite locally (`prisma/dev.db`) / Aiven Hosted PostgreSQL compatible

### How to Deploy to Vercel + Aiven PostgreSQL
1. Create a free PostgreSQL instance on [Aiven](https://aiven.io/free-postgresql-database).
2. Change `provider = "postgresql"` in `prisma/schema.prisma`.
3. Set `DATABASE_URL` in Vercel project environment variables.
4. Set `SESSION_SECRET`, `GROQ_API_KEY`, and `GROQ_MODEL` in Vercel.
5. Deploy and run `npx prisma db push && npm run seed`.

---

## Known Limitations
- Fictional employee accounts only; public registration is disabled by specification design.
- Groq free tier has rate limits (TPM); a 60-second timeout and retry logic are implemented to handle momentary rate spikes gracefully.
- AI conversion requires a valid `GROQ_API_KEY` set in `.env`.

---

## Submission Summary
- **Source repository**: [GitHub Repository URL]
- **Setup & seed commands**: `npm install`, `npx prisma db push`, `npm run seed`, `npm run dev`
- **Demo login accounts**: 10 accounts seeded with `Demo123!`
- **Features completed**: Seeded Auth, RBAC Isolation, AI Transcript Automation, All-or-Nothing Transaction Save, Role Dashboards, My Tasks Grouping, Team Directory, Reset Facility.
