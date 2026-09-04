# Supabase Database Files

This directory records the database setup used by the MarketOps Hub public demo. It contains no API keys, passwords, or other secrets.

## Files

- `schema.sql` creates the `public.leads` table, validation constraints, Row Level Security policies, and grants required by the demo.
- `seed.sql` adds the 12 Demo Lead records. It can be run repeatedly because rows with the same UUID are updated instead of duplicated.

## Using the Supabase SQL Editor

1. Open the relevant project in the Supabase Dashboard.
2. Select **SQL Editor** and create a new query.
3. For a new or empty project, paste and run `schema.sql` first.
4. Paste and run `seed.sql` after the schema has been created.

Review the SQL before running it against an existing or production database. These files document the public Demo configuration and are not a migration history.

## Demo Security Warning

The schema enables anonymous Select, Insert, Update, and Delete access to `public.leads`. This allows the login-free portfolio Demo to show persistent CRUD, but any visitor can change or remove its Lead records. This policy must not be used for sensitive or production data.

A production version should add:

- Authentication
- Role-based access control and record-level authorization
- A database-level unique email constraint, if uniqueness matches the product requirements
- Live audit logging for data changes
