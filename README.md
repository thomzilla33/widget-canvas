# AIMS OS — Composable Dashboards (prototype)

Interactive React prototype for the AIMS OS Composable Dashboards module. Three surfaces:

- **Admin · Widget Builder + Library** — build reusable widgets (5-step wizard) and browse the catalog with health signals.
- **Admin · Dashboard Builder** — create dashboards (entity + audience, conflict detection, blank/template) and compose them on a 4-zone canvas with per-widget permissions, Quick Actions, and density guards.
- **End-user · UCP** — Unified Contact Profile that consumes dashboards, with the trust layer (freshness + governed/ungoverned origin), AI Summary, Quick Actions, and personalization.

## Stack

React 18 · Vite · React Router v6 · Tailwind CSS (AIMS OS tokens) · Recharts · Lucide.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173/widget-canvas/
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Publishes the build to the `gh-pages` branch:

```bash
npm run deploy
```

One-time setup: GitHub repo → **Settings → Pages → Source: Deploy from a branch → `gh-pages` / (root)**.

Live URL: `https://thomzilla33.github.io/widget-canvas/`

> Internal prototype. State is in-memory (mock data) — no backend.
