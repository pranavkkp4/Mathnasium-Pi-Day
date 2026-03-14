# Mathnasium Pi Day Website

A Pi Day themed website for Mathnasium with:

- React + Vite front end
- Node + Express + SQLite backend
- Global leaderboard
- Two one-try-only games per player name:
  - **Math Facts Sprint** — 60 seconds of addition, subtraction, multiplication, and whole-number division using values from 1–15
  - **Pi Memory Mode** — type digits of π from memory; clicking away, switching tabs, or losing input focus ends the run
- Dedicated **History of Pi** page
- Mathnasium-inspired black, red, and white visual theme

## Project structure

- `frontend/` — React + Vite app
- `backend/` — Express API with SQLite leaderboard
- `.github/workflows/deploy.yml` — example GitHub Pages deploy workflow for the front end

## Local development

### Backend
```bash
cd backend
npm install
npm start
```

The API defaults to `http://localhost:3001`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## GitHub Pages + leaderboard note

GitHub Pages only hosts static files, so the React front end can live on GitHub Pages, but the leaderboard API must be hosted separately (for example Render, Railway, Fly.io, or another Node-compatible host). Set the deployed API URL in:

- `frontend/.env` as `VITE_API_URL=https://your-api.example.com`

## Custom domain

If you want a domain like `mathnasiumpiday.com`, buy the domain and point it to GitHub Pages in your repository settings and DNS provider.

## API endpoints

- `GET /health`
- `GET /scores?gameType=facts`
- `GET /scores?gameType=pi`
- `GET /attempts/check?name=Pranav&gameType=facts`
- `POST /scores`

## One-try rule

The backend enforces a unique attempt per normalized name + game type. If a player has already submitted a score for a mode, the API returns HTTP `409`.
