# NovaWorks PM MVP

A lightweight, browser-based project management CRM for project managers. The frontend uses a demo login and local state so the project can be deployed to Vercel without a database.

## Features

- Demo login for administrators, managers, and agents
- Project dashboard with role-aware visibility
- Transcript-to-project workflow
- Grok API integration with a local demo fallback
- Project details and task tables
- Responsive layout using the supplied brand colors and Montserrat

## Run locally

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open `http://localhost:3000`

Demo accounts:

- Administrator: `admin@novaworks.example` / `Demo123!`
- Manager: `ayesha@novaworks.example` / `Demo123!`
- Agent: `ali@novaworks.example` / `Demo123!`

## Grok setup

Create a `.env.local` file with:

```env
GROK_API_KEY=your_xai_api_key
GROK_MODEL=grok-3-mini
```

The API route runs server-side and never exposes the key. If the key is missing or the request fails, the app uses the supplied sample transcript for a working local demo.

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set `GROK_API_KEY` and optionally `GROK_MODEL` in project environment variables.
4. Deploy. The app uses browser storage, so no database is required.

## Known limitations

- Data is not persistent across browser resets; it is stored in local storage and reset on a new deployment.
- The MVP uses a deterministic transcript fallback rather than a production AI service when Grok is unavailable.
- The demo login is intentionally not a real authentication system.
