# MarketOps Hub

**Live Demo:** [https://marketops-hub-git-main-kira-bb54.vercel.app/](https://marketops-hub-git-main-kira-bb54.vercel.app/)

## Overview

MarketOps Hub is a general-purpose marketing operations management platform for Marketing and Operations teams. It brings campaign planning, partner coordination, activity execution, lead tracking, and performance reporting into one consistent workspace.

## Problem

Marketing teams often manage campaigns, partners, activities, and leads across disconnected Excel files, Notion pages, email threads, and other tools. This fragmentation makes information difficult to find, status changes difficult to trace, and overall performance difficult to summarize.

## Solution

MarketOps Hub provides a single interface for managing the core objects involved in marketing operations. Teams can organize campaigns, external partners, execution activities, and generated leads, then use the Dashboard to review results and upcoming work at a glance.

## Core Features

- **Dashboard:** Key metrics, lead funnel, lead-source breakdown, campaign performance, upcoming activities, and recent leads.
- **Campaign Management:** Create, view, search, filter, edit, and delete marketing campaigns.
- **Partner Management:** Manage KOLs, influencers, agencies, dealers, vendors, media organizations, and other partners.
- **Activity Management:** Manage events, exhibitions, field demos, webinars, roadshows, product launches, and offline promotions.
- **Lead Management:** Track leads, their sources, linked marketing records, status, owner, and potential value.
- **Activity Log:** Review sample business actions and status changes across the platform.
- **Search & Filtering:** Narrow records by relevant keywords, categories, channels, sources, and statuses.
- **CSV Export:** Export all currently visible or filtered leads for use in Excel and other tools.

## Core Workflow

```text
Campaign → Partner / Activity → Lead → Dashboard
```

A campaign defines the marketing initiative. Partners can support its execution, while activities represent specific work such as an exhibition or webinar. These efforts generate leads, and the Dashboard summarizes the resulting performance.

## Example Use Cases

- B2B marketing programs
- Consumer brand campaigns
- Influencer and KOL collaboration
- Events and exhibitions
- Field demos and roadshows
- Webinar lead generation
- North American agricultural marketing operations

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
- Browser-native APIs for CSV export
- Git for version history

No database, authentication provider, charting library, or external backend service is currently used.

## Project Structure

```text
src/
├── app/
│   ├── dashboard/       # Marketing analytics overview
│   ├── campaigns/       # Campaign page
│   ├── partners/        # Partner page
│   ├── activities/      # Activity page
│   ├── leads/           # Lead page
│   └── activity-log/    # Activity Log page
└── components/
    ├── campaigns/       # Campaign UI, types, and mock data
    ├── partners/        # Partner UI, types, and mock data
    ├── activities/      # Activity UI, types, and mock data
    ├── leads/           # Lead UI, CSV export, types, and mock data
    ├── dashboard/       # Dashboard calculations and presentation
    ├── activity-log/    # Log UI, types, and mock data
    └── app-shell.tsx    # Shared navigation and page layout
```

## How to Run Locally

Requirements: a current Node.js LTS release with npm.

1. Open a terminal in the project folder.
2. Install the project packages:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in a browser.

Optional project checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Current Limitations

- The application currently uses local mock data.
- Changes made in the interface are reset after a page refresh.
- There is no database or persistent backend.
- Authentication and permissions are not implemented.
- Cross-module changes are not synchronized in real time.
- Activity Log contains example records and is not a live audit system.

## Future Improvements

- Database persistence
- Authentication
- Role-based permissions
- CSV import
- Cross-module real-time data synchronization
- Third-party integrations
- A live audit trail generated from real user actions

## AI-Assisted Development

MarketOps Hub was built through an AI-assisted, iterative workflow using Codex. Codex helped break down requirements, scaffold the project, implement modules and interactions, debug issues, run quality checks, and improve the code. Product direction, MVP scope, functional decisions, manual acceptance testing, and approval of each development stage remained the responsibility of the project owner.

For a fuller account of the process, see [docs/AI_DEVELOPMENT.md](docs/AI_DEVELOPMENT.md).
