# AI-Assisted Development Process

## Development Approach

MarketOps Hub was developed iteratively with Codex rather than generated as one complete application. The project owner defined one bounded stage at a time, reviewed the result in the browser, identified issues or inconsistencies, and approved a Git commit only after manual acceptance testing.

This approach kept the MVP focused and made it easier to verify each business concept before moving to the next module.

## Development Stages

### 1. Project Initialization

The local development environment was checked first. A Next.js project using TypeScript and Tailwind CSS was then created without a database, authentication, or other backend services.

### 2. Information Architecture Correction

The initial page structure did not match the intended product model. After review, it was corrected to six core areas: Dashboard, Campaigns, Partners, Activities, Leads, and Activity Log. Unneeded navigation concepts such as Content, Calendar, Tasks, and Settings were removed before the initial project structure was accepted.

### 3. Campaigns

The Campaigns module introduced local campaign records, search, status and channel filters, create/edit/delete interactions, and basic validation. Campaign data includes ownership, budget, dates, lead targets, results, channel, and status.

### 4. Partners

The Partners module added external relationship management for KOLs, influencers, agencies, dealers, vendors, media organizations, and other partner types. It includes search, filters, local create/edit/delete interactions, and validation.

### 5. Activities

The Activities module represented concrete marketing execution such as webinars, exhibitions, field demos, launches, and roadshows. Activity forms use existing mock Campaign and Partner names as selectable relationships without implementing complex cross-module synchronization.

### 6. Leads

The Leads module added lead tracking across multiple sources and lifecycle statuses. It includes links to existing Campaign, Activity, and Partner mock records, plus validation for required fields, email format, and non-negative potential value.

### 7. Dashboard

The Dashboard was built from the existing module mock data. It calculates operational KPIs, the lead funnel, source distribution, campaign completion rates, upcoming activities, and recent leads rather than maintaining a separate independent dataset.

### 8. Currency Consistency Fix

Manual review found that example budgets and potential values were displayed with the Chinese yuan symbol. Currency presentation was then standardized to USD across Campaigns, Activities, Leads, and the Dashboard without changing the underlying values or business logic.

### 9. Activity Log

The Activity Log added sample records for created, updated, status-changed, and deleted actions across Campaign, Partner, Activity, and Lead modules. It supports search and filtering, but it is intentionally not connected to live actions elsewhere in the application.

### 10. CSV Export

The Leads module gained a browser-native CSV export. It exports the current filtered result, includes the relevant lead fields, handles CSV special characters, and requires no additional package.

### 11. CSV Import and Compatibility Fix

CSV Import was added as a separate iteration. Users can upload a CSV, preview total, valid, and invalid row counts, review validation errors, import valid rows, and download a template. The first version added valid rows only to browser memory; persistence was added in a later accepted iteration.

During manual acceptance testing, the first version could not import a CSV produced by the application's own Export feature. The exported file used user-friendly headers such as `Name`, `Potential Value`, and `Created Date`, while the importer expected internal names such as `name`, `potentialValue`, and `createdAt`. The importer was corrected with header normalization and mapping for both schemas, including case differences, whitespace, UTF-8 BOMs, quoted headers, and common line endings.

### 12. Supabase Read Integration

Supabase was introduced in stages rather than replacing every mock dataset at once. The official JavaScript client and environment-variable configuration were added first. A PostgreSQL `leads` table was designed with UUID primary keys, timestamps, field constraints, seed data, and Row Level Security.

The Leads page was then changed to read from Supabase with loading, error, and mock fallback states. This read-only integration was manually reviewed before database writes were added.

### 13. Supabase CRUD Persistence and RLS Setup

After the read path was accepted, Create, Edit, and Delete were connected to Supabase so changes persisted after refresh and used database-generated UUIDs. CSV Import remained browser-only at this stage and was addressed separately later.

The RLS configuration was reviewed separately before persistent frontend CRUD was enabled. For the public, login-free portfolio demo, anonymous Select, Insert, Update, and Delete policies were configured for the `leads` table. This is a temporary demonstration policy and is explicitly not suitable for production or sensitive data.

### 14. Campaign Detail and Related Leads Migration

A dynamic Campaign Detail route was added with campaign information, performance progress, related Activities, related Leads, and summary metrics. Campaign and Activity data remained mock-based. The first detail implementation also used mock Leads. A later review identified that this conflicted with the Supabase-backed Leads page, so Related Leads and their summary metrics were changed to load dynamically from Supabase with loading, error, and fallback behavior.

### 15. Persistent CSV Imports

The CSV Import persistence gap was addressed after the rest of the Lead CRUD flow was already backed by Supabase. The implementation reused the existing Lead field mapping, batch inserted valid rows, and updated the page only with database-returned records so imported Leads use the stored UUID and `created_at` values. Importing and failure states were added without changing the established preview, validation, template, or export behavior.

Duplicate email validation was also added before import. It compares non-empty email addresses against the currently loaded Supabase Leads and earlier valid rows in the same file, ignoring case and surrounding whitespace. Because the database does not yet enforce a unique email constraint, this remains application-level protection rather than a complete concurrency guarantee.

### 16. V2 Relational Data Refactor

**V1 problem:** Campaign, Activity, and Partner primarily used independent mock datasets while Lead used Supabase. Name strings represented relationships, so the modules could drift and Campaign performance did not share one source of truth.

**V2 decision:** The project owner prioritized the data model and business chain before adding more UI features. Campaign, Activity, Partner, Lead, and Opportunity were designed as separate PostgreSQL tables connected by UUID foreign keys: Campaign → Activity → Lead → Opportunity → Revenue.

Codex prepared the SQL schema and idempotent relational seed, added snake_case-to-camelCase data layers, migrated Campaign/Partner/Activity CRUD, upgraded Lead relationship selectors, moved Campaign Detail and core Dashboard KPIs to Supabase data, and added mapping and performance tests. Existing mock data remains an explicit fallback. The SQL was intentionally not executed automatically; applying it and accepting the resulting cloud data remain human-controlled steps.

For this iteration, the human responsibility covered product positioning, user scenarios, object definitions, core relationships, scope, and acceptance criteria. Codex handled schema preparation, data access, CRUD wiring, mapping, tests, build checks, and debugging.

### 17. Opportunity Lifecycle and Revenue Workflow

Opportunity was implemented as a separate business object because a Lead represents a potential contact, while an Opportunity represents a confirmed commercial deal with its own stage, value, close date, and revenue outcome. The workflow now supports manual Opportunity creation and prefilled creation from a Lead, persistent CRUD, pipeline summaries, Campaign attribution, and Won/Lost revenue reporting.

Lead status and Opportunity stage are intentionally not fully bidirectional. Creating an Opportunity advances an eligible New, Contacted, or Qualified Lead to Opportunity. Won and Lost stages advance the linked Lead to the same final status. Reopening a closed Opportunity does not move the Lead backward, which avoids accidentally reversing its lifecycle history.

The project owner defined the Opportunity lifecycle, status synchronization rules, KPI formulas, workflow scope, and acceptance criteria. Codex implemented the Supabase CRUD queries, forms and modals, list and pipeline UI, field mapping, state synchronization, and focused tests.

### 18. Lead Follow-up and Task Management

V2 could track Leads, Opportunities, and revenue, but it did not answer the daily operational question: who needs attention, who owns the next action, and when is it due? Without that layer, users would still rely on spreadsheets, calendars, or personal notes to execute follow-ups.

Tasks were introduced as a focused execution tool rather than a general project-management system. Leads can store contact history, next follow-up time, follow-up status, and notes. Tasks can represent follow-ups, calls, emails, meetings, or preparation work and may link to a Lead, Opportunity, Campaign, or Activity. Completing a Follow-up Task records contact time on its Lead but deliberately does not generate another date or advance the Lead to Qualified or Opportunity.

The project owner defined the workflow, follow-up rules, automation boundaries, KPI definitions, and acceptance criteria. Codex prepared the non-destructive migration, Supabase CRUD, time classification and filters, UI, relationship mapping, and focused tests. Activity Log remains illustrative; converting it into a live audit system is a separate future improvement.

## Human vs. AI Responsibilities

### Human Responsibilities

- Define the project direction and intended users.
- Decide the MVP scope and development order.
- Translate marketing operations needs into functional requirements.
- Review AI-generated output in the running application.
- Perform manual acceptance testing after each module.
- Identify product inconsistencies, including information architecture and currency display.
- Decide which features not to build at the current stage.
- Approve each Git commit.

### AI / Codex Responsibilities

- Scaffold the project implementation.
- Generate pages and reusable components.
- Implement local CRUD interactions, search, and filtering.
- Write validation, CSV import/export, and Supabase data-access logic.
- Run TypeScript, ESLint, and production build checks.
- Assist with debugging and consistency fixes.
- Explain implementation results in accessible language.

## Example Iterations

### Information Architecture Revision

The first page structure did not follow the required product model. The project owner reviewed it and requested a clear revision to Dashboard, Campaigns, Partners, Activities, Leads, and Activity Log. Codex then updated the navigation and page structure before the first accepted commit.

### Currency Revision

The first Dashboard version displayed Total Potential Value with the `¥` symbol. During acceptance testing, the project owner identified that budgets and values should use USD. Codex updated the presentation consistently across all relevant modules, and the owner reviewed the result before approving the Dashboard commit.

### Module-by-Module Acceptance

Campaigns, Partners, Activities, Leads, Dashboard, Activity Log, and CSV export were implemented as separate stages. Each stage was manually reviewed before the project owner authorized its Git commit. This created a traceable history instead of one large, difficult-to-review change.

### CSV Header Compatibility

The initial CSV Import implementation passed its own validation tests but failed when the project owner uploaded a file created by MarketOps Hub's Export feature. Manual testing exposed the mismatch between internal and display headers. Codex traced the two schemas and added normalization so the system's exported CSV could be imported without manual editing.

### Staged Supabase Adoption

Supabase was not connected to every module at once. The project first established the client configuration and SQL design, then verified Lead reads, and only afterward added persistent Create, Edit, and Delete operations. RLS behavior was checked before enabling anonymous writes for the public demo.

### Campaign Detail Data-Source Correction

The first Campaign Detail page correctly matched related records by Campaign name but used mock Leads. The project owner noticed that `/leads` had already moved to Supabase, creating a data-source inconsistency. Related Leads and Lead-based summary values were then changed to read from Supabase, while Campaigns and Activities deliberately remained mock-based.

### CSV Import Persistence

**Problem:** CSV Import originally added valid rows only to browser memory, so refreshing the page lost imported data.

**Iteration:** The persistence gap was identified, the existing Supabase Lead mapping logic was reused, and a batch insert was added. Successful imports now use database-returned UUID and `created_at` values. The import dialog gained an importing state and failure handling, while duplicate email validation checks existing Supabase Leads before writing. Existing CSV preview, row validation, template compatibility, and export behavior were preserved.

**Validation:** Two valid Leads were imported and confirmed to remain after a page refresh. A duplicate email was rejected, and invalid email, negative potential value, and invalid status cases continued to be rejected. Search, filtering, and export still worked. The two test records were deleted afterward so the Demo dataset returned to its original state.

**Lesson:** A feature is not complete just because the UI interaction works; persistence and refresh behavior are part of product acceptance.

## Lessons Learned

- **AI does not replace requirement definition.** Clear business goals and field definitions are still necessary.
- **Small iterative prompts are more reliable.** A focused module is easier to implement, review, and correct than an entire product generated at once.
- **Manual acceptance testing is necessary.** A technically valid build can still contain product inconsistencies that only become clear during review.
- **Scope control is important.** Explicitly postponing databases, authentication, permissions, and complex synchronization helped keep the MVP understandable.
- **Git commits make development traceable.** Separate approved commits provide a clear record of how the product evolved.
- **Data-source consistency matters.** Related views should use the same source of truth when one module moves from mock data to persistent storage.
- **Security choices must match the environment.** Anonymous CRUD can make a portfolio demo easy to evaluate, but it should not be treated as a production permission model.
- **Persistence is part of acceptance.** Successful UI feedback is not enough when users reasonably expect imported records to remain after refresh.

## Outcome

This project does not present the code as entirely handwritten or claim advanced traditional programming experience. It demonstrates the project owner's ability to define a business problem, make product decisions, guide an AI development tool, test the resulting application, request corrections, and turn operational requirements into a working software product.
