# Prompt Library — Medi-care Migration

> Useful prompts from this session + reusable templates for the next session.
> Last updated: 2026-06-02

---

## 1. Prompts Used This Session (verbatim / paraphrased)

### Analysis kickoff
> "Analyze current Nestar monorepo structure to transform existing NestJS Monorepo Nestar platform into Medi-care hospital platform."

### The safe-rename instruction (high value — reuse exactly)
> "Safe rename layer (no business logic change). Rename all visible project/app identifiers from Nestar to Medi-care. Do not change domain logic. Keep APIs and database collections unchanged. Update package names and environment constants. Run lint and typecheck after refactoring. Please make a plan first!"

### Documentation generation
> "Create a `docs/` folder and generate BACKEND_MIGRATION / DECISIONS / FRONTEND_MIGRATION / COMPLETED_TASKS / NEXT_STEPS / PROMPTS markdown files summarizing the migration state. Do not change source code; documentation only; be precise and technical; use tables."

---

## 2. Why These Worked

- **"Make a plan first"** forced a review gate before edits — caught the DB-name nuance before any damage.
- **Explicit guardrails** ("do not change domain logic / APIs / collections") gave a crisp, checkable scope.
- **"Run lint and typecheck after"** baked verification into the request.
- **"Use markdown tables where useful"** produced scannable, technical docs.

---

## 3. Reusable Prompt Templates (for next session)

### A. Phase 2 — domain remap planning
```
Plan Phase 2 of the Nestar→Medi-care migration per AGENTS.md / docs/ai/DECISIONS.md
ADR-006: rename the `property` domain to `hospital`, change MemberType roles
USER/AGENT/ADMIN to PATIENT/NURSE/DOCTOR/ADMIN, and add the new domains doctor,
doctor-schedule, appointment, payment, patient-profile (with the AGENTS.md ER rules
and healthcare enums). Produce a file-by-file plan covering schema, DTOs, enums,
resolver, service, batch jobs, and MongoDB migration scripts. Migrate one workflow
at a time. Do NOT touch the database yet. Plan first, then wait for approval.
```

### B. Add the appointment domain
```
Add a new `appointment` NestJS GraphQL module to apps/medicare-api following the
existing per-domain pattern (module + resolver + service, libs/dto/<x>, libs/enums/<x>,
schemas/<X>.model.ts). An appointment links a PATIENT member and a DOCTOR, has a
time slot and status. Match the existing code style. Plan first.
```

### C. Safe rename (generic, reusable)
```
Safe rename layer only: rename <OLD> → <NEW> across visible project/app identifiers,
package name, scripts, config paths, import paths, and user-facing strings. Do NOT
change domain logic, GraphQL API names, or MongoDB collections/DB name. Use `git mv`
for file moves. After editing, run typecheck + build + eslint on changed files and
report results. Plan first; wait for approval.
```

### D. Lint/tooling cleanup
```
Fix the broken `lint` and `format` script globs in package.json (the `//` pattern
matches no files; use `/**/*.ts`). Then run `eslint --fix` and resolve remaining
errors. List what changed. Do not alter domain logic.
```

### E. Frontend lockstep migration
```
Using docs/FRONTEND_MIGRATION.md, execute Step <N>. Rename the listed routes/components
and GraphQL documents from real-estate to hospital terminology, then run graphql-codegen
and `tsc`. Only proceed with GraphQL document renames if the backend already exposes the
new names. Plan first.
```

### F. Documentation refresh
```
Update docs/COMPLETED_TASKS.md and docs/NEXT_STEPS.md to reflect this session's work.
Be precise and technical, include files changed and validation status, use markdown tables.
Do not change source code.
```

---

## 4. Prompt Hygiene Notes

- Always end migration prompts with **"Plan first; wait for approval."**
- Always state the **guardrails** (what must NOT change) explicitly.
- Always request **verification commands** (typecheck/build/lint) in the same prompt.
- Reference the **docs/** files by name so context carries across sessions.
