# Next Steps — Priority Order

> Planning doc for the next working session. Grouped by track; ordered by priority within each track.
> Last updated: 2026-06-02

---

## 🔴 P0 — Decisions that unblock everything

1. **Decide the core domain mapping** (see `DECISIONS.md` ADR-006): `Property` → `Doctor only`, `Doctor + Appointment`, or `Appointment as core`. Phase 2 cannot start without this.
2. **Decide DB strategy**: keep `/Nestar` database name, or plan a data migration to a `Medicare` DB (with backfill + cutover window).
3. **Commit Phase 1** rename (if approved) on the `modification` branch or a dedicated `rename/medicare` branch.

---

## 🛠️ Backend Cleanup

| Priority | Task |
|---|---|
| 1 | Fix the broken `lint` script glob `{src,apps,libs,test}//*.ts` → `{apps,libs}/**/*.ts`; fix `format` glob likewise |
| 2 | Auto-fix the 56 pre-existing lint errors (`eslint --fix`) and manually resolve unused-import errors |
| 3 | Remove stale `dist/apps/nestar*` build artifacts; confirm `deleteOutDir` cleans correctly |
| 4 | Update `README.md` (still NestJS boilerplate) to describe Medi-care |
| 5 | Update `AGENTS.md` / `SKILLS.md` with concrete Medi-care backend instructions |

---

## 🧬 Backend Domain Migration (Phase 2 — after P0 decisions)

| Priority | Task |
|---|---|
| 1 | Rename `MemberType` values `USER/AGENT/ADMIN` → `PATIENT/DOCTOR/ADMIN`; update guards/roles |
| 2 | Rename `property` module/domain → `doctor` (schema, DTOs, enums, resolver, service) |
| 3 | Replace `PropertyType/Status/Location` → `Specialty/DoctorStatus/Department` enums |
| 4 | Add new `appointment` domain (schema, DTOs, resolver, service) if chosen |
| 5 | Update `batch` jobs to rank doctors instead of agents/properties |
| 6 | Write MongoDB migration scripts for any collection/field renames |

---

## 💻 Frontend Migration (see `FRONTEND_MIGRATION.md`)

| Priority | Task |
|---|---|
| 1 | Cosmetic: branding + terminology pass (safe to ship now, no API dependency) |
| 2 | Route/page remap with `next.config.js` redirects |
| 3 | GraphQL document renames + `graphql-codegen` regeneration (lockstep with backend Phase 2) |
| 4 | Component remap (`PropertyCard → DoctorCard`, etc.) |
| 5 | New appointment booking UI |

---

## ✅ Testing

| Priority | Task |
|---|---|
| 1 | Get `npm run lint` actually running (depends on glob fix) and green |
| 2 | Add unit tests for `auth` guards and `batch` ranking (currently only boilerplate e2e specs exist) |
| 3 | Fix/define e2e specs — current `app.e2e-spec.ts` expects `'Hello World!'` but services return the Welcome string (pre-existing mismatch) |
| 4 | Smoke-test GraphQL queries against a dev DB after Phase 2 renames |
| 5 | Frontend: codegen typecheck + Cypress/Playwright smoke after document renames |

---

## 📚 Documentation

| Priority | Task |
|---|---|
| 1 | Keep `docs/COMPLETED_TASKS.md` updated per session |
| 2 | Fill `DECISIONS.md` ADR-006 with the chosen domain mapping once decided |
| 3 | Add an ER/domain diagram for the target hospital model (Member ↔ Doctor ↔ Appointment) |
| 4 | Document the GraphQL schema diff (old vs new) as Phase 2 lands |
| 5 | Write a data-migration runbook if the DB is renamed |
