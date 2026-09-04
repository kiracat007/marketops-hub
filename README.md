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
- **Campaign Management:** Create, search, filter, edit, and delete marketing campaigns, with a detail view for performance and related records.
- **Partner Management:** Manage KOLs, influencers, agencies, dealers, vendors, media organizations, and other partners.
- **Activity Management:** Manage events, exhibitions, field demos, webinars, roadshows, product launches, and offline promotions.
- **Lead Management:** Track leads, their sources, linked marketing records, status, owner, and potential value with Supabase-backed persistence.
- **Activity Log:** Review sample business actions and status changes across the platform.
- **Search & Filtering:** Narrow records by relevant keywords, categories, channels, sources, and statuses.
- **CSV Export:** Export all currently visible or filtered leads for use in Excel and other tools.
- **CSV Import:** CSV import with validation and Supabase persistence, including preview, error identification, batch insertion of valid records, duplicate email checks, and a compatible downloadable template.
- **Supabase-backed Lead Persistence:** Leads are loaded from Supabase, and Create, Edit, and Delete operations persist across page refreshes.
- **Campaign Detail View:** View campaign information, performance, related activities, related leads, and summary metrics.

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
- Supabase
- PostgreSQL / Supabase Database
- `@supabase/supabase-js`
- ESLint
- Browser-native APIs for CSV import and export
- Git for version history

No authentication provider or external charting library is currently used.

## Architecture and Data Persistence

MarketOps Hub currently uses a hybrid data model:

- **Leads:** Loaded from and persisted to a Supabase `leads` table. Create, edit, and delete operations use database-generated UUIDs and remain available after refresh.
- **Campaign Detail Related Leads:** Loaded dynamically from Supabase and filtered by matching the Lead `campaign` value to the current Campaign name.
- **Campaigns, Partners, and Activities:** Continue to use local mock data and browser memory for CRUD interactions.
- **Dashboard and Activity Log:** Continue to use the project's mock datasets. Activity Log is illustrative rather than a live audit trail.
- **CSV Import:** Valid rows are batch inserted into Supabase, use database-returned UUIDs and timestamps, and remain available after page refresh. Duplicate email validation runs before import against existing Leads and other rows in the same file. Comparison ignores case and surrounding whitespace, while empty emails are not treated as duplicates.

Supabase reads and writes include loading and error states. If a Lead query fails, the interface remains usable and can fall back to the local Lead dataset.

## Project Structure

```text
src/
├── app/
│   ├── dashboard/       # Marketing analytics overview
│   ├── campaigns/       # Campaign list and dynamic detail page
│   ├── partners/        # Partner page
│   ├── activities/      # Activity page
│   ├── leads/           # Lead page
│   └── activity-log/    # Activity Log page
└── components/
    ├── campaigns/       # Campaign UI, types, and mock data
    ├── partners/        # Partner UI, types, and mock data
    ├── activities/      # Activity UI, types, and mock data
    ├── leads/           # Supabase Lead CRUD, CSV tools, types, and fallback data
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

3. Copy `.env.local.example` to `.env.local` and add the Supabase Project URL and Publishable Key:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   `.env.local` is ignored by Git and must not be committed.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in a browser.

Optional project checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Current Limitations

- Campaigns, Partners, and Activities still primarily use local mock data.
- Leads are persisted in Supabase.
- Valid CSV Import rows are batch inserted into Supabase and persist after page refresh.
- Duplicate email detection currently happens at the application layer; the database does not yet enforce a unique constraint on email, so concurrent imports could theoretically create duplicates.
- Activity Log uses sample records and is not a live audit trail.
- Authentication and role-based permissions are not implemented.
- The current public demo uses an anonymous RLS policy for the Leads table, which is suitable only for demonstration purposes and not for production.
- Dashboard and some cross-module data are not fully synchronized in real time.
- Campaign Detail uses mock Campaign and Activity data, while Related Leads are loaded dynamically from Supabase.

## Security and Demo Notes

The current Supabase Row Level Security policies allow anonymous visitors to select, insert, update, and delete Lead records so the public portfolio demo can demonstrate persistent CRUD without login. The frontend uses only the public Supabase Publishable Key; no service role or secret key is exposed.

This anonymous-write policy is intentionally demo-only and is not appropriate for production. Any visitor could modify or remove Lead data, submit spam, or automate requests. A production version should require authentication, restrict access by role and record ownership, protect sensitive contact information, and add appropriate abuse controls.

## Future Improvements

- Authentication
- Role-based permissions
- Enforce database-level email uniqueness where appropriate
- Migrate Campaigns, Partners, and Activities to Supabase
- Real-time cross-module synchronization
- Live audit logging
- Third-party integrations

## AI-Assisted Development

MarketOps Hub was built through an AI-assisted, iterative workflow using Codex. Codex helped break down requirements, scaffold the project, implement modules and interactions, integrate Supabase, debug CSV compatibility and data-source issues, run quality checks, and improve the code. Product direction, MVP scope, functional decisions, manual acceptance testing, and approval of each development stage remained the responsibility of the project owner.

For a fuller account of the process, see [docs/AI_DEVELOPMENT.md](docs/AI_DEVELOPMENT.md).
