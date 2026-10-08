<p align="center">
  <img src="./public/logo_main.png" alt="Genesis" width="220" />
</p>

# Genesis

Genesis is a lightweight project-delivery CRM for tracking clients, projects, tasks, owners, deadlines, and estimated effort. The current MVP uses browser storage for app data and demo-only login; it does not require a database or an external authentication provider.

## Features

- **Role-based demo access** for administrators, project managers, and agents.
- **Project dashboard** with project status cards and role-aware project visibility.
- **Client directory** with client summary cards, current project/task metrics, and next due dates.
- **Client profiles** where administrators and managers can update company/contact details, connect or remove tasks, and view a monthly deadline calendar.
- **Project details** with task completion, task editing, task creation, and project closure when every task is complete.
- **Transcript-to-project workflow** that uses Groq when configured and supports the included sample transcript as a deterministic fallback.
- **Team directory** for browsing team roles and specializations.
- Responsive interface using the Genesis brand colors and Montserrat.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

All seeded accounts use the password `Demo123!`.

| Role | Email |
|---|---|
| Administrator | `admin@genesis.example` |
| Manager | `ayesha@genesis.example` |
| Agent | `ali@genesis.example` |

The login screen also provides buttons for the demo accounts. No real authentication provider is currently connected.

## Transcript AI configuration

Transcript processing runs through a server-side API route. To enable Groq, create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

`GROQ_MODEL` is optional; the server uses `llama-3.3-70b-versatile` when it is not set. Keep the API key on the server and out of client-side code.

If Groq is unavailable, the app only returns the built-in demo projects when the submitted transcript mentions all three seeded clients: UrbanCart, QuickServe, and HelpDeskPro. Other transcripts return an error rather than being silently converted into demo data.

## Data storage and current limitations

- Projects, clients, task updates, and the demo user session are stored in the browser's `localStorage`.
- Changes are local to that browser profile and are not shared between users or devices.
- Browser storage persists independently of Vercel deployments, but can be lost if the user clears site data or changes browsers/devices.
- Demo login is for development and evaluation only. It is not secure authentication and must not protect real customer data.
- Client representative and company-type details may initially be blank; they can be filled in from the client profile.

## Deploy the current MVP to Vercel

The current app can be deployed without a database:

1. Push the repository to GitHub and import it into Vercel.
2. Optionally set `GROQ_API_KEY` and `GROQ_MODEL` in the Vercel project's environment variables to enable transcript AI.
3. Deploy. Without a Groq key, the supported sample transcript fallback remains available.

## Database and authentication handoff

Database persistence and real authentication have **not** been implemented. When adding them:

- Use PostgreSQL through a Vercel Marketplace provider such as Neon; new Vercel Postgres databases are no longer provisioned as a built-in product.
- A serverless-compatible Postgres driver and an ORM such as Drizzle are suitable for Vercel. Keep database access server-side, add schema migrations, and never expose database credentials to the browser.
- Model users, clients, projects, and tasks with stable IDs and database relationships. The current client records are inferred from project client names, and browser storage should be treated as seed/import data rather than a production database.
- Move reads and writes behind server-side route handlers or server actions before connecting the UI to the database. Preserve the existing context-facing operations where practical to keep the UI decoupled from storage.
- Keep demo accounts usable for previews and testing without a real identity provider. Make demo mode explicit and restrict it to local development or preview deployments; do not silently grant demo access to production customer data if auth configuration is missing.
- Treat the existing `localStorage` login as a UI demo only. It does not validate credentials on a trusted server, create secure sessions, or enforce authorization for protected data.

## Useful commands

```bash
npm run dev
npm run build
npm start
```
