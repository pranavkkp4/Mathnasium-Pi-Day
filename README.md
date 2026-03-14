# Mathnasium Pi Day Website

A Pi Day themed website for Mathnasium with:

- React + Vite front end
- Supabase-backed leaderboard
- Two one-try-only games per player name:
  - **Math Facts Sprint** — 60 seconds of addition, subtraction, multiplication, and whole-number division using values from 1–15
  - **Pi Memory Mode** — type digits of π from memory; clicking away, switching tabs, or losing input focus ends the run
- Dedicated **History of Pi** page
- Mathnasium-inspired black, red, and white visual theme

## Project structure

- `frontend/` — React + Vite app
- `supabase/schema.sql` — SQL schema and policies for the hosted leaderboard
- `.github/workflows/deploy.yml` — GitHub Pages deploy workflow for the front end

## Local development

### Supabase
Open the Supabase SQL editor and run:

- `supabase/schema.sql`

Then create:

- `frontend/.env`
- `frontend/.env.production`

using the values from Supabase Project Settings -> API:

- `VITE_SUPABASE_URL=https://your-project-ref.supabase.co`
- `VITE_SUPABASE_ANON_KEY=your-public-anon-key`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## GitHub Pages + leaderboard note

The correct deployment shape is:

- GitHub Pages for `frontend/`
- Supabase for the leaderboard data

This repo now reads leaderboard data directly from Supabase using the public anon key and row-level security policies in `supabase/schema.sql`.

For the GitHub Pages deployment workflow, add these in your GitHub repository settings:

- `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`
- Create a repository variable named `VITE_SUPABASE_URL`
- Create a repository variable named `VITE_SUPABASE_ANON_KEY`
- Set them to the same values used in `frontend/.env.production`

## Custom domain

If you want a domain like `mathnasiumpiday.com`, buy the domain and point it to GitHub Pages in your repository settings and DNS provider.

## One-try rule

Supabase enforces one official attempt per normalized name and game type in the database using a generated `normalized_name` column plus a unique constraint.

## Security note

This setup is good for a simple public leaderboard, but browser-side writes are not tamper-proof. A user can still submit an arbitrary score if they bypass the UI. If you need trusted score validation, move score submission into a server-side function.
