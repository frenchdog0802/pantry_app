# Pantry App (LarderMind) — Web Frontend

> **Note:** This file is partially outdated. For accurate stack and run instructions, use the repo root [README.md](../../README.md) and [PROJECT_STATUS.md](../../PROJECT_STATUS.md).

## Overview

**LarderMind** web client — React + Vite SPA that talks to the Spring Boot backend.

## Quick run

```powershell
cd client
npm install
npm run dev
```

Backend must be running on port 8080 (Vite proxies `/api`).

## Structure

```
client/
├── src/
│   ├── App.tsx              View router (state-based)
│   ├── index.css            Warm Kitchen design tokens
│   ├── api/                 REST client modules
│   ├── components/          UI screens
│   └── contexts/            authContext, pantryContext
├── design-system/cookcopilot/MASTER.md
└── e2e/                     Playwright tests
```

## Design

Warm Kitchen palette — see `client/design-system/cookcopilot/MASTER.md` and `client/src/index.css`.

## Tests

```powershell
cd client
npm run test:e2e
```
