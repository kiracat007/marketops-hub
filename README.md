# MarketOps Hub

**Live Demo:** [https://marketops-hub.vercel.app/](https://marketops-hub.vercel.app/)

## Overview

MarketOps Hub is a general-purpose marketing operations management platform for Marketing and Operations teams. It brings campaign planning, partner coordination, activity execution, lead tracking, and performance reporting into one consistent workspace.

## Problem

Marketing teams often manage campaigns, partners, activities, and leads across disconnected Excel files, Notion pages, email threads, and other tools. This fragmentation makes information difficult to find, status changes difficult to trace, and overall performance difficult to summarize.

## Solution

MarketOps Hub provides a single interface for managing marketing operations. V4 connects execution and follow-up to attributed pipeline, revenue, and performance review.

## Core Features

- **Dashboard:** Key metrics, lead funnel, lead-source breakdown, campaign performance, upcoming activities, and recent leads.
- **Campaign Management:** Supabase-backed create, search, filter, edit, and delete, with a detail view for performance and related records.
- **UTM Link Builder:** Campaign tracking with Source, Medium, Campaign, optional Content/Term, URL validation, parameter preservation, and one-click copy.
- **Partner Management:** Persist KOLs, influencers, agencies, distributors, vendors, media organizations, and other partners in Supabase.
- **Activity Management:** Persist activities and connect them to real Campaign and optional Partner foreign keys.
- **Lead Management:** Track leads, their sources, linked marketing records, status, owner, and potential value with Supabase-backed persistence.
- **Lead Follow-up:** Record last contact, schedule the next follow-up, track follow-up status and notes, and surface overdue Leads.
- **Task Management:** Manage daily follow-ups, calls, emails, meetings, and preparation tasks linked to Leads, Opportunities, Campaigns, or Activities.
- **Needs Attention:** See overdue follow-ups, tasks due today, and new Leads without a scheduled next action.
- **Activity Log:** Review sample business actions and status changes across the platform.
- **Search & Filtering:** Narrow records by relevant keywords, categories, channels, sources, and statuses.
- **CSV Export:** Export all currently visible or filtered leads for use in Excel and other tools.
- **CSV Import:** CSV import with validation and Supabase persistence, including preview, error identification, batch insertion of valid records, duplicate email checks, and a compatible downloadable template.
- **Supabase-backed Lead Persistence:** Leads are loaded from Supabase, and Create, Edit, and Delete operations persist across page refreshes.
- **Campaign Detail View:** View campaign information, performance, related activities, related leads, and summary metrics.
- **Opportunity Management:** Create Opportunities manually or from qualified Leads, manage the full Discovery-to-Won/Lost lifecycle, track pipeline and won revenue, and attribute commercial value to Campaigns.
- **Marketing Attribution:** Use explainable single-touch Campaign, Activity, and Lead Source attribution based on Supabase relationships.
- **Campaign Performance:** Compare spend, Leads, qualified Leads, pipeline, revenue, CPL, CPQL, conversion, ROI, ROAS, Win Rate, and target attainment. Funnel conversion is deduplicated by Lead even when one Lead has multiple Opportunities.
- **Campaign Report:** Generate a factual Campaign review, export its metrics as CSV, or print/save the report as PDF without an AI service.

## Core Workflow

```text
Campaign → Activity → Lead → Follow-up → Opportunity → Revenue → Performance Review
```

The daily execution workflow is: Lead → Assign Owner → Contact → Schedule Follow-up → Create Task → Opportunity.

A campaign defines the marketing initiative. Partners can support its execution, while activities represent specific work such as an exhibition or webinar. These efforts generate leads, and the Dashboard summarizes the resulting performance.

## Example Use Cases

- B2B marketing programs
- Consumer brand campaigns
- Influencer and KOL collaboration
- Events and exhibitions
- Field demos and roadshows
- Webinar lead generation
- Generate trackable campaign URLs for social, event, and partner channels
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

MarketOps Hub V2 uses Supabase as the primary source for its operational chain:

- **Campaigns, Partners, and Activities:** Loaded from Supabase with persistent CRUD. Activities use real Campaign and Partner UUID foreign keys.
- **Leads:** Persisted in Supabase and linked through `campaign_id`, `activity_id`, and `partner_id`; legacy display-name fields remain compatible with CSV workflows.
- **Opportunities:** Stored separately from Leads and linked to their source Lead and Campaign.
- **Campaign Detail:** Loads Campaign, Activities, Leads, and Opportunities from Supabase and calculates related performance.
- **Attribution:** An Opportunity uses its own `campaign_id` first; Activity and Source outcomes are attributed through its linked Lead. Potential Value is never treated as revenue.
- **Dashboard:** Uses Supabase data for spend, open pipeline, won revenue, ROI, Top Campaigns, and the real Leads-to-Won funnel, with explicit local fallback if the relational schema is unavailable.
- **Activity Log:** Remains illustrative rather than a live audit trail.
- **CSV Import:** Valid rows are batch inserted into Supabase, use database-returned UUIDs and timestamps, and remain available after page refresh. Duplicate email validation runs before import against existing Leads and other rows in the same file. Comparison ignores case and surrounding whitespace, while empty emails are not treated as duplicates.

Supabase reads and writes include loading and error states. If a Lead query fails, the interface remains usable and can fall back to the local Lead dataset.

### Database Schema

The repository includes the V2 target-schema reference, a non-destructive V1-to-V2 migration, read-only preflight/verification scripts, and an optional protected Thailand Q4 Market Expansion seed under [`supabase/`](supabase/). Existing projects must use the migration workflow rather than running `schema.sql` directly. See [`supabase/README.md`](supabase/README.md) before using any SQL file.

## Project Structure

```text
src/
├── app/
│   ├── dashboard/       # Marketing analytics overview
│   ├── campaigns/       # Campaign list and dynamic detail page
│   ├── partners/        # Partner page
│   ├── activities/      # Activity page
│   ├── leads/           # Lead page
│   ├── opportunities/   # Opportunity pipeline and CRUD page
│   ├── tasks/           # Daily Task and follow-up management
│   └── activity-log/    # Activity Log page
└── components/
    ├── campaigns/       # Supabase CRUD, detail metrics, UI, and fallback data
    ├── partners/        # Supabase Partner CRUD and fallback data
    ├── activities/      # Supabase Activity CRUD and relationship selectors
    ├── leads/           # Supabase Lead CRUD, foreign keys, CSV tools, and fallback data
    ├── opportunities/   # Opportunity CRUD, pipeline metrics, workflow, and Supabase access
    ├── tasks/           # Task CRUD, due-date logic, relationships, and Supabase access
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

- The V2 SQL must be applied manually before relational reads and writes are available.
- The V3 follow-up and Tasks migration must be applied manually before those features are available.
- Local mock datasets remain only as a resilience/demo fallback and for the static Activity Log.
- Valid CSV Import rows are batch inserted into Supabase and persist after page refresh.
- Duplicate email detection currently happens at the application layer; the database does not yet enforce a unique constraint on email, so concurrent imports could theoretically create duplicates.
- Activity Log uses sample records and is not a live audit trail.
- Authentication and role-based permissions are not implemented.
- After the V3 migration, the public demo uses anonymous RLS policies for all six operational tables; this is suitable only for demonstration and not production.
- Activity Log is not a live audit trail, and the UI does not subscribe to realtime database events.

## Security and Demo Notes

The current Supabase Row Level Security policies allow anonymous visitors to select, insert, update, and delete Campaign, Partner, Activity, Lead, Opportunity, and Task records so the public portfolio demo can demonstrate persistent relationships without login. The migrations remove historical elevated table privileges from the frontend roles: `anon` receives only Select, Insert, Update, and Delete, while `authenticated` receives no direct business-table permissions in this no-login phase. The frontend uses only the public Supabase Publishable Key; no service role or secret key is exposed.

This anonymous-write policy is intentionally demo-only and is not appropriate for production. Any visitor could modify or remove Lead data, submit spam, or automate requests. A production version should require authentication, restrict access by role and record ownership, protect sensitive contact information, and add appropriate abuse controls.

## Future Improvements

- Authentication
- Role-based permissions
- Enforce database-level email uniqueness where appropriate
- Real-time cross-module synchronization
- Live audit logging
- Third-party integrations

## AI-Assisted Development

MarketOps Hub was built through an AI-assisted, iterative workflow using Codex. Codex helped break down requirements, scaffold the project, implement modules and interactions, integrate Supabase, debug CSV compatibility and data-source issues, run quality checks, and improve the code. Product direction, MVP scope, functional decisions, manual acceptance testing, and approval of each development stage remained the responsibility of the project owner.

For a fuller account of the process, see [docs/AI_DEVELOPMENT.md](docs/AI_DEVELOPMENT.md).
