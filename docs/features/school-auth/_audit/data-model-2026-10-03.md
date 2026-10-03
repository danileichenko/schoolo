# Audit — data-model school-auth (2026-10-03)

## Staged migrations

| Ordinal | Up | Down |
|---|---|---|
| 01 | `docs/features/school-auth/migrations/01_unique_schools_name.up.sql` | `.down.sql` |
| 02 | `docs/features/school-auth/migrations/02_create_staff_members.up.sql` | `.down.sql` |
| 03 | `docs/features/school-auth/migrations/03_create_teacher_invites.up.sql` | `.down.sql` |
| 04 | `docs/features/school-auth/migrations/04_create_sessions.up.sql` | `.down.sql` |

**Migrations are staged — not yet in the live `apps/api/prisma/migrations/` tree.** `implement` promotes them (assigns Prisma timestamp folders + updates `schema.prisma`).

## Promote-time convention hint

- Tool: Prisma Migrate (`prisma migrate`).
- Live tree already has `20260203120000_init` creating `schools`.
- Next live folder ≈ `YYYYMMDDHHMMSS_*` after promote; do not grab a number now.
- Corroborate: TEXT PKs, `created_at`, snake_case via Prisma `@map` / `@@map`.

## Convention adherence

- Follows ULID TEXT ids and `created_at` (no `updated_at` — repo scaffold has none).
- Status/role as TEXT (app-enforced enums) — no CHECK constraints (scaffold has none).
- Reuses existing `schools.name` as display name + unique index (no rename migration).
- TeacherInvite FK to School (pending exists before StaffMember); managed by users module per SAD.

## Drift detection

- Domain layer for school-auth not implemented yet — no field-vs-column drift.
- Scaffold `School` model will need Prisma fields for relations when promoted.

## Self-check

| Check | Result |
|---|---|
| Naming matches repo | pass |
| Down reversibility | pass (DROP INDEX / DROP TABLE pairs) |
| FK indexes | pass (`school_id`, `staff_member_id`) |
| Convention adherence | pass |

## TBD / open

- Concrete password hash algorithm (argon2id vs bcrypt) — `api` / implement choice, not schema.
- Session cookie TTL — app config; `expires_at` column ready.
