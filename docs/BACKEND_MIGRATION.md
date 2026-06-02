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

**Medi-care** is the target **hospital-management** platform, reusing the same NestJS GraphQL monorepo skeleton. The intent (per `AGENTS.md`) is a hospital domain where:

- `Member` becomes the identity layer for **patients / doctors / admins**.
- The core sellable entity (`Property`) is intended to become a clinical entity (**Doctor profile** and/or **Appointment**) in a later phase.
- Supporting domains (articles, comments, likes, follows, views, chat) map to health content, reviews, favorites, follow-a-doctor, profile views, and patient↔doctor messaging.

**As of this session, only the rename layer is done.** The domain entities are still real-estate (`Property`, `PropertyType`, etc.); no clinical schema exists yet.

---

## 3. Backend Migration Goal

Transform the real-estate Nestar backend into the Medi-care hospital backend in **safe, staged layers**:

1. **Phase 1 — Rename layer (DONE):** rename all visible project/app identifiers `Nestar → Medi-care`. No logic, API, or DB changes.
2. **Phase 2 — Domain remap (PENDING):** `MemberType` roles → `PATIENT/DOCTOR/ADMIN`; `Property` → `Doctor` and a new `Appointment` domain.
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
| `auth` | Import paths updated only | Role enum values change (`AGENT→DOCTOR`) |
| `member` | Unchanged | Add doctor/patient profile fields |
| `property` | Unchanged | Rename → `doctor`; add new `appointment` module |
| `board-article` | Unchanged | Re-theme to health articles |
| `comment` | Unchanged | Re-theme to reviews |
| `like` / `follow` / `view` | Unchanged | Favorites / follow-a-doctor / profile views |
| `socket` (chat) | Import paths updated only | Patient↔doctor messaging (no structural change) |
| `batch` | Import paths + string updated | Rank doctors instead of agents/properties |

> No new modules were added in Phase 1. All module wiring (`components.module.ts`) is structurally unchanged.

---

## 6. GraphQL Changes

**Phase 1: NONE.** All GraphQL object types, inputs, queries, mutations, resolvers, and registered enum names are **byte-for-byte unchanged**. The API contract is fully backward compatible.

**Phase 2 (planned, not done):**

| Current GraphQL surface | Planned |
|---|---|
| `MemberType` values `USER/AGENT/ADMIN` | `PATIENT/DOCTOR/ADMIN` |
| `createProperty`, `getProperties`, `getAgentProperties`, `likeTargetProperty`, … | `createDoctor` / `getDoctors` / `getDoctorProfiles` / `likeTargetDoctor`, plus new `bookAppointment`, `getAppointments` |
| `Property`, `Properties`, `PropertyInput`, `PropertyUpdate` | `Doctor*`, plus new `Appointment*` types |
| `PropertyType`, `PropertyStatus`, `PropertyLocation` | `Specialty`, `DoctorStatus`, `Department` |

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
