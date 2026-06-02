# Backend Migration — Nestar → Medi-care

> Status: **Phase 1 complete** (safe rename layer). Domain logic migration not yet started.
> Last updated: 2026-06-02

---

## 1. Original Project Summary (Nestar)

**Nestar** is a real-estate marketplace backend built as a **NestJS GraphQL monorepo**.

| Aspect | Detail |
|---|---|
| Framework | NestJS 10 |
| API style | GraphQL (Apollo Server 4, `@nestjs/graphql` code-first) |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT (`@nestjs/jwt`) + role guards |
| Realtime | WebSocket chat (`socket.io` + `ws`) |
| Uploads | `graphql-upload` (property images) |
| Scheduling | `@nestjs/schedule` (batch ranking jobs) |
| Apps | `nestar-api` (port 3007), `nestar-batch` (port 3008) |

**Domain model (8 components + auth):**
`member`, `property`, `board-article`, `comment`, `like`, `follow`, `view`, and cross-cutting `auth`.

Core entity is **Property** (a listing owned by an `AGENT` member). Members can like/view/comment/favorite properties; agents own listings; admins moderate. A batch app recomputes `propertyRank` / `memberRank` on a schedule.

---

## 2. New Project Summary (Medi-care)

**Medi-care** is the target **hospital-management** platform, reusing the same NestJS GraphQL monorepo skeleton. The canonical domain model is defined by `AGENTS.md` (source of truth) and locked in `DECISIONS.md` ADR-006:

- `Member` is the base account (`members` collection) with roles **`PATIENT / NURSE / DOCTOR / ADMIN`**.
- **`Property` → `Hospital`** — the care-room / catalog-style entity (the direct rename target).
- **New domains:** `Doctor` (profile, `doctors.memberId → members._id`), `DoctorSchedule`, `Appointment` (patient↔doctor booking), `Payment` (one per appointment), `PatientProfile` (medical data extending a member).
- Supporting domains (board article, comment, like, follow, view, notification, chat) carry over; per AGENTS.md, **do not** add reviews or redesign notifications during appointment/payment work.

**As of this session, only the rename layer is done.** The domain entities are still real-estate (`Property`, `PropertyType`, etc.); no clinical schema exists yet.

---

## 3. Backend Migration Goal

Transform the real-estate Nestar backend into the Medi-care hospital backend in **safe, staged layers**:

1. **Phase 1 — Rename layer (DONE):** rename all visible project/app identifiers `Nestar → Medi-care`. No logic, API, or DB changes.
2. **Phase 2 — Domain remap (PENDING):** `MemberType` roles → `PATIENT/NURSE/DOCTOR/ADMIN`; `Property` → `Hospital`; add `Doctor`, `DoctorSchedule`, `Appointment`, `Payment`, `PatientProfile`. Migrate one workflow at a time.
3. **Phase 3 — Data & API:** GraphQL type renames, schema/collection changes, migrations.
4. **Phase 4 — Frontend alignment** (see `FRONTEND_MIGRATION.md`).

---

## 4. Naming Changes (Phase 1 — completed)

| Category | From | To |
|---|---|---|
| Package name | `nestar` | `medicare` |
| App directory | `apps/nestar-api` | `apps/medicare-api` |
| App directory | `apps/nestar-batch` | `apps/medicare-batch` |
| Nest project key | `nestar-api` | `medicare-api` |
| Nest project key | `nestar-batch` | `medicare-batch` |
| Build outDir | `dist/apps/nestar-*` | `dist/apps/medicare-*` |
| Welcome string (API) | `Welcome to Nestar Rest API server!` | `Welcome to Medi-care Rest API server!` |
| Welcome string (batch) | `Welcome to Nestar BATCH server!` | `Welcome to Medi-care BATCH server!` |
| e2e describe block | `NestarBatchController` | `MedicareBatchController` |
| Import paths | `apps/nestar-api/src/...` | `apps/medicare-api/src/...` |

**Files touched:** `package.json`, `nest-cli.json`, both `tsconfig.app.json`, `batch.module.ts`, `batch.service.ts`, `auth.guard.ts`, `roles.guard.ts`, `app.service.ts`, batch `app.e2e-spec.ts`.

**Bonus fix:** the pre-existing `test:e2e` typo `apps/nestars-api` was corrected to `apps/medicare-api`.

---

## 5. Module Changes

| Module | Phase 1 (rename) | Phase 2 (planned) |
|---|---|---|
| `auth` | Import paths updated only | Roles → `PATIENT/NURSE/DOCTOR/ADMIN` |
| `member` | Unchanged | Keep `members` base; add `PatientProfile` domain (no `doctor` id on members) |
| `property` | Unchanged | Rename → `hospital` (catalog entity) |
| (new) `doctor` | — | New module: profile, `doctors.memberId → members._id` |
| (new) `doctor-schedule` | — | New module: availability slots |
| (new) `appointment` | — | New module: patient↔doctor bookings |
| (new) `payment` | — | New module: one payment per appointment |
| (new) `patient-profile` | — | New module: medical data extending a member |
| `board-article` | Unchanged | Carry over (health content) |
| `comment` / `like` / `follow` / `view` | Unchanged | Carry over (no review redesign per AGENTS.md) |
| `socket` (chat) | Import paths updated only | Patient↔doctor messaging (no structural change) |
| `batch` | Import paths + string updated | Adjust ranking to healthcare entities |

> No new modules were added in Phase 1. All module wiring (`components.module.ts`) is structurally unchanged.

---

## 6. GraphQL Changes

**Phase 1: NONE.** All GraphQL object types, inputs, queries, mutations, resolvers, and registered enum names are **byte-for-byte unchanged**. The API contract is fully backward compatible.

**Phase 2 (planned, not done):**

| Current GraphQL surface | Planned |
|---|---|
| `MemberType` values `USER/AGENT/ADMIN` | `PATIENT/NURSE/DOCTOR/ADMIN` |
| `createProperty`, `getProperties`, `getAgentProperties`, … | `createHospital` / `getHospitals` / … ; plus new `Doctor`, `Appointment`, `Payment` operations |
| `Property`, `Properties`, `PropertyInput`, `PropertyUpdate` | `Hospital*` types; plus new `Doctor*`, `DoctorSchedule*`, `Appointment*`, `Payment*`, `PatientProfile*` |
| `PropertyType`, `PropertyStatus`, `PropertyLocation` | `doctorStatus`, `specialization`, `scheduleStatus`, `dayOfWeek`, `appointmentStatus`, `paymentStatus`, `paymentMethod`, `gender`, `bloodType` (see AGENTS.md) |

---

## 7. MongoDB Collection / Schema Changes

**Phase 1: NONE — intentional.**

| Item | State |
|---|---|
| Collection names (`members`, `properties`, …) | Unchanged |
| Mongoose schema fields | Unchanged |
| Schema indexes | Unchanged |
| **Database name `Nestar`** in `MONGO_DEV` / `MONGO_PROD` | **Preserved** — renaming it would point at a different database (data change, not a rename) |

**Phase 2 considerations:** any collection rename (`properties → doctors`) requires a data migration script and a read-compatibility window. Field renames (`propertyX → doctorX`) likewise require migration + dual-read or a one-time backfill.

---

## 8. Compatibility Notes

- ✅ **API consumers unaffected** by Phase 1 — no GraphQL schema names changed.
- ✅ **Existing data unaffected** — collections, fields, indexes, and DB name untouched.
- ✅ **Git history preserved** — all moves done via `git mv` (tracked as renames, not delete+add).
- ⚠️ **Stale build artifacts**: old `dist/apps/nestar*` dirs may linger; they are gitignored and regenerated on a clean build (`deleteOutDir: true`).
- ⚠️ **Pre-existing tooling issues** (not introduced here): broken `lint`/`format` globs and 56 pre-existing lint errors — see `COMPLETED_TASKS.md` and `NEXT_STEPS.md`.
- ⚠️ **Frontend not yet aligned** — any Next.js client still references the old app names only where it hits the API by URL/port (unchanged), so it keeps working; terminology/codegen changes come in Phase 2+.
