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

The Leads module gained a browser-native CSV export. It exports the current filtered result, includes the relevant lead fields, handles CSV special characters, and requires no additional package. CSV import was deliberately kept outside the current scope.

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
- Write basic validation and CSV-generation logic.
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

## Lessons Learned

- **AI does not replace requirement definition.** Clear business goals and field definitions are still necessary.
- **Small iterative prompts are more reliable.** A focused module is easier to implement, review, and correct than an entire product generated at once.
- **Manual acceptance testing is necessary.** A technically valid build can still contain product inconsistencies that only become clear during review.
- **Scope control is important.** Explicitly postponing databases, authentication, permissions, and complex synchronization helped keep the MVP understandable.
- **Git commits make development traceable.** Separate approved commits provide a clear record of how the product evolved.

## Outcome

This project does not present the code as entirely handwritten or claim advanced traditional programming experience. It demonstrates the project owner's ability to define a business problem, make product decisions, guide an AI development tool, test the resulting application, request corrections, and turn operational requirements into a working software product.
