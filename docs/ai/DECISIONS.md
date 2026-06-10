# Architectural Decisions — Nestar → Medi-care

> Decision log for the migration. Each entry: **what** was decided, **why**, **risks**, and **alternatives** considered.
> Last updated: 2026-06-02

---

## ADR-001 — Stage the migration; do the rename layer first

**Decision:** Split the migration into phases and execute a **rename-only Phase 1** before any domain logic change.

**Why:** A pure rename is mechanically verifiable (typecheck + build + lint) and reversible. It de-risks the large domain remap by first establishing a clean Medi-care identity with zero behavioral change.

**Risks:** A rename-only phase leaves the codebase semantically inconsistent (Medi-care names wrapping real-estate logic) until Phase 2 lands. Could confuse new contributors.

**Alternatives:**
- *Big-bang rename + domain remap together* — rejected: high blast radius, hard to verify, hard to revert.
- *Keep Nestar names indefinitely* — rejected: the project is now Medi-care; identity drift hurts onboarding.

---

## ADR-002 — Use `git mv` for all file/folder renames

**Decision:** Rename `apps/nestar-api → apps/medicare-api` and `apps/nestar-batch → apps/medicare-batch` via `git mv`.

**Why:** Preserves file history as renames (Git shows `R`), keeping `git blame` / `git log --follow` intact across the migration boundary.

**Risks:** Minimal. Git rename detection can occasionally mis-pair files, but here all renames were 1:1 directory moves.

**Alternatives:** Plain `mv` + `git add` — rejected: muddier diffs, weaker history continuity.

---

## ADR-003 — Do NOT change GraphQL API surface in Phase 1

**Decision:** Leave every GraphQL type, query, mutation, resolver, and registered enum name unchanged.

**Why:** Keeps any API consumer (frontend, mobile, integrations) working through Phase 1. Decouples "rename the project" from "rename the domain".

**Risks:** The API still exposes real-estate vocabulary (`Property`, `getProperties`) under the Medi-care project — a temporary naming mismatch.

**Alternatives:** Rename GraphQL types alongside the project — rejected: breaks clients and conflates two independent concerns.

---

## ADR-004 — Do NOT change MongoDB collections, schemas, or the database name

**Decision:** Keep collection names (`members`, `properties`, …), all schema fields/indexes, and the `/Nestar` database name in the Mongo connection strings.

**Why:** The user constraint was explicit: *keep the database unchanged*. The DB name in the URI is a **data pointer**, not a project identifier — changing `/Nestar` would silently connect to a different (empty) database, which is a data migration, not a rename.

**Risks:** The connection string visibly contains `Nestar`, which looks inconsistent with the Medi-care branding. This is intentional and documented.

**Alternatives:**
- *Rename DB to `Medicare` now* — rejected: requires data migration + downtime; out of scope for a rename layer.
- *Create a new empty `Medicare` DB* — rejected: would lose existing data references.

---

## ADR-005 — Verify with typecheck + build + targeted lint, not the project `lint` script

**Decision:** Validate the rename with `tsc --noEmit` (both apps), `nest build`, and `eslint` on the changed files — rather than relying on `npm run lint`.

**Why:** The repo's `lint` script glob (`{src,apps,libs,test}//*.ts`) is **pre-existingly broken** (matches no files). Running it would produce a misleading failure unrelated to the rename. Targeted eslint on changed files proves the rename introduced no new violations.

**Risks:** The 56 pre-existing repo-wide lint errors remain unaddressed (deliberately out of scope).

**Alternatives:** Fix the lint glob during Phase 1 — rejected: scope creep beyond "rename only" (logged in `NEXT_STEPS.md` instead).

---

## ADR-006 — Core domain model (ACCEPTED, defined by AGENTS.md)

**Decision:** The core domain mapping is **no longer open** — it is fixed by `AGENTS.md` as the canonical spec. The target hospital model is:

| Real-estate (Nestar) | Healthcare (Medi-care) | Kind |
|---|---|---|
| `Property` (catalog listing) | **`Hospital`** (care-room / catalog entity) | rename |
| — | **`Doctor`** (professional profile, `doctors.memberId → members._id`) | new |
| — | **`DoctorSchedule`** (availability, `doctorSchedules.doctorId → doctors._id`) | new |
| — | **`Appointment`** (patient↔doctor booking) | new |
| — | **`Payment`** (one per appointment) | new |
| — | **`PatientProfile`** (medical data extending a member) | new |
| `MemberType` `USER/AGENT/ADMIN` | `PATIENT / NURSE / DOCTOR / ADMIN` | rename |

**Why:** Earlier this was deferred (a hospital has both a provider and a transaction entity, unlike real-estate's single `Property`). `AGENTS.md` resolves it: **Hospitals are the catalog entity** (the `Property` analog), while Doctor / Schedule / Appointment / Payment / PatientProfile are **new** domains. This supersedes the earlier "Property → Doctor" assumption in prior drafts of `BACKEND_MIGRATION.md` / `FRONTEND_MIGRATION.md`.

**Risks:** Larger Phase 2 scope (5 new domains + 1 rename) vs a single rename. Mitigated by AGENTS.md's "migrate one workflow at a time" rule.

**Constraints carried from AGENTS.md:** no `hospitalId` on doctors/appointments; no `currency`/`transactionId` on payments; no reviews or notification redesign during appointment/payment work; do not store a `doctor` ObjectId on `members` (ownership lives on `doctors.memberId`).

---

## ADR-007 — Keep app names domain-neutral but branded (`medicare-api`, `medicare-batch`)

**Decision:** Apps are named `medicare-api` / `medicare-batch` (single word `medicare`, no hyphen) rather than function-specific names (e.g. `hospital-api`).

**Why:** Mirrors the original `nestar-api`/`nestar-batch` convention (brand + role), matches the npm package name `medicare`, and minimizes churn.

**Risks:** None significant.

**Alternatives:** `api`/`batch` (drop brand) — rejected: loses product identity in multi-repo/CI contexts.

---

## ADR-008 — Reconcile app-name spelling to `medicare-*` (not `medi-care-*`)

**Decision:** Where docs/specs disagreed on hyphenation, the canonical form is **`medicare-api` / `medicare-batch`** (matching the committed folders and `package.json` name). `AGENTS.md` was updated to match the repo.

**Why:** The Phase 1 rename committed `medicare-*` and the project builds under those names. Editing one spec doc is far lower risk than re-renaming 80+ files; `medicare` also matches the npm package name.

**Risks:** The product brand is written "Medi-care" (hyphenated) in UI strings, so identifiers (`medicare`) and brand ("Medi-care") differ in spelling. Accepted and documented.

**Alternatives:** Rename folders to `medi-care-*` to match the brand exactly — rejected: a second large rename with no functional benefit. Revisit only if a hard naming requirement emerges.

---

## ADR-009 — Add `doctors.hospitalId` (explicitly overrides the "no hospitalId on doctors" rule)

**Decision:** Introduce a single, **optional** foreign key `doctors.hospitalId → hospitals._id` linking a doctor to the hospital they work at. This is the explicit migration that AGENTS.md (ER Model Rules) permitted: *"Do not add `hospitalId` to doctors or appointments **unless a later migration explicitly changes this decision.**"* This ADR is that change — **for doctors only**.

**Why:** The hospital detail UI must list "doctors at this hospital," which was impossible with no relation. The existing ER uses single ObjectId references on the owning entity (`doctors.memberId`, `doctorSchedules.doctorId`, `appointments.doctorId`); a `doctors.hospitalId` ref is the consistent, minimal way to model it.

**Scope / shape:**
- Single FK (one hospital per doctor), **optional** → existing doctors keep working, no data migration required.
- Set by the doctor via `createDoctor` / `updateDoctor`; validated to reference an existing hospital.
- `getDoctors` gains a `search.hospitalId` filter; aggregation adds `lookupHospital` (+ preserve-null unwind) exposing `hospitalData`.

**Explicitly unchanged:** Appointments remain **doctor-based** — the rule against `hospitalId` on **appointments** still stands. No `currency`/`transactionId` on payments; no reviews/notification changes. No `doctor` id stored on members (ownership still via `doctors.memberId`).

**Risks:** A doctor can belong to only one hospital (no multi-affiliation). If many-to-many is later required, a follow-up migration (array or join collection) supersedes this.

**Alternatives:** Many-to-many join collection — rejected for now: heavier and diverges from the single-FK pattern used everywhere else.
