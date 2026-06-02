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

## ADR-006 — Defer the core domain mapping decision (Doctor vs Appointment)

**Decision:** Do not yet decide whether `Property` becomes `Doctor`, `Appointment`, or both. Leave it for Phase 2.

**Why:** A hospital has two related core entities (the **provider/Doctor** and the **transaction/Appointment**) where real-estate had one (`Property`). The split materially changes Phase 2 scope and should be decided deliberately, not implicitly during a rename.

**Risks:** Phase 2 cannot start until this is chosen; blocks downstream schema and frontend work.

**Alternatives (to be chosen in Phase 2):**
| Option | Description | Trade-off |
|---|---|---|
| Doctor + new Appointment | Rename Property→Doctor, add Appointment domain | Fullest model, most work |
| Doctor only | Rename Property→Doctor, defer booking | Smallest faithful step |
| Appointment as core | Property→Appointment directly | Skips a doctor catalog |

---

## ADR-007 — Keep app names domain-neutral but branded (`medicare-api`, `medicare-batch`)

**Decision:** Rename apps to `medicare-api` / `medicare-batch` rather than function-specific names (e.g. `hospital-api`).

**Why:** Mirrors the original `nestar-api`/`nestar-batch` convention (brand + role), minimizing churn and keeping the monorepo layout familiar.

**Risks:** None significant.

**Alternatives:** `api`/`batch` (drop brand) — rejected: loses product identity in multi-repo/CI contexts.
