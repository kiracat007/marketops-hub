# Supabase Database Files

These files document the MarketOps Hub public Demo database. They contain no API keys, passwords, or service-role credentials.

## File Purposes

- `schema.sql` is the complete V2 target-schema reference for a **new or empty project**. It is not the migration for an existing V1 database.
- `migrations/20260925_v2_preflight.sql` is a strictly read-only inspection for an existing V1 project.
- `migrations/20260925_v2_relational_model.sql` is the transactional, non-destructive V1-to-V2 migration for an existing `public.leads` table.
- `migrations/20260925_v2_verify.sql` is a strictly read-only post-migration verification.
- `seed.sql` is an optional relational Demo dataset. It checks UUID and business-name conflicts before inserting anything.
- `leads.sql` is a legacy V1 reference and must not be used for a new V2 setup.

## Required Backup Before Migration

Do not run the V2 migration until the existing Leads data and database metadata have been backed up manually. At minimum, export:

- All rows from `public.leads` as CSV
- The current `public.leads` table definition
- Existing Leads constraints and indexes
- Existing Leads RLS policies

The repository does not perform or automate this backup.

## Existing V1 Project: Required Execution Process

1. Back up Leads data and metadata as listed above.
2. Run `migrations/20260925_v2_preflight.sql` in the Supabase SQL Editor.
3. Review every preflight result. Confirm required columns exist, `leads.id` is UUID, relationship columns are either absent or UUID, Seed UUIDs are unused or match the expected names, and Seed business names do not already use different UUIDs.
4. Run `migrations/20260925_v2_relational_model.sql`.
5. Run `migrations/20260925_v2_verify.sql`.
6. Confirm tables, UUID columns, foreign keys, indexes, RLS, policies, record counts, and zero orphan/invalid rows.
7. Optionally run `seed.sql`. Do not run it when preflight shows a UUID or business-name conflict; resolve that conflict manually first.
8. Run `migrations/20260925_v2_verify.sql` again.
9. Manually test the web application and its CRUD relationships.

Do not use `schema.sql` for this V1-to-V2 upgrade. It is a full target reference, not an existing-database migration.

## New or Empty Project

For a genuinely new project with no existing MarketOps tables or data, review and run `schema.sql`. The optional `seed.sql` may be run afterward. The migration path above is required whenever `public.leads` already contains data.

## What the Read-Only Preflight Shows

The preflight file uses only `SELECT` statements. It reports:

- Existing MarketOps tables
- Leads columns and types
- Leads constraints and indexes
- RLS status, existing policies, and current `anon`/`authenticated` grants
- Fixed Seed UUID occupancy
- Existing Seed business-name conflicts
- Existing generic and project-specific updated-at functions

The migration intentionally does not remove the legacy `"Demo anonymous access"` policy or any other unknown policy. After migration, inspect the Supabase policies screen for duplicate permissive policies and decide manually whether an older policy should be removed.

## Migration Safety Model

The migration:

- Runs inside one transaction
- Requires an existing Leads table and required baseline columns
- Requires `leads.id` and any existing relationship columns to be UUID
- Adds nullable relationship columns without updating existing rows
- Adds explicitly named foreign keys with `ON DELETE SET NULL`
- Uses the project-specific `public.marketops_set_updated_at()` function
- Replaces only the project-owned `marketops_demo_anon_access` policy
- Revokes historical direct table privileges from only `anon` and `authenticated`
- Re-grants `anon` only Select, Insert, Update, and Delete
- Does not grant `anon` Truncate, References, or Trigger
- Does not grant an `authenticated` policy or direct business-table privileges
- Does not alter `service_role`, `postgres`, or any other role
- Does not delete, truncate, rebuild, or bulk-update existing Leads

If a required check or foreign-key validation fails, the transaction is expected to roll back.

## Optional Seed Safety

The Seed runs in its own transaction. Before inserting rows, it verifies every fixed UUID and expected business name across Campaigns, Partners, Activities, Leads, and Opportunities. It stops with an exception when:

- A fixed UUID belongs to an unexpected record
- The expected business name already exists under a different UUID

Only records owned by the fixed Seed UUIDs can be updated. Non-Seed Leads are not modified. Repeated successful execution restores all business fields defined by the Seed without adding duplicate fixed-UUID records.

## Demo Security Warning

Each operational table receives the `marketops_demo_anon_access` policy and anonymous Select, Insert, Update, and Delete grants.

Before those grants are applied, the migration uses `REVOKE ALL PRIVILEGES` specifically for `anon` and `authenticated` on the five MarketOps tables. It then restores only the four required CRUD privileges to `anon`. `service_role`, `postgres`, and other roles are not named by these statements and are therefore unaffected.

**THIS POLICY IS FOR DEMO PURPOSES ONLY.**
**DO NOT USE THIS POLICY FOR SENSITIVE PRODUCTION DATA.**

Any visitor can change or remove Demo records. A production version should add authentication, role-based and record-level authorization, abuse protection, database-level uniqueness rules where appropriate, and live audit logging.
