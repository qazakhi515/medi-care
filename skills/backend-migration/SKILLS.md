`name`: `backend-migration`

`description`: `Continue the Nestar/property backend to Medi-care migration while preserving the existing NestJS GraphQL architecture.`

# Medi-care Backend Migration

Use this skill for migration passes or pre-edit analysis across the backend.

# Review Checklist

- Read AGENTS.md, docs/ai/BACKEND_MIGRATION.md, docs/ai/DECISIONS.md, docs/ai/COMPLETED_TASKS.md, and docs/ai/NEXT_STEPS.md when present.
- Preserve the existing NestJS resolver/service/module pattern.
- Keep DTOs, schemas, enums, filters, and shared types under the existing apps/\*/src/libs structure.
- Replace old property, real-estate, product, petshop, and agent terminology only inside the touched Medi-care workflow.
- Do not remove working logic unless it is replaced safely.
- Update docs/ai/COMPLETED_TASKS.md after major completed work.
- Run focused typecheck/build validation when behavior changes.
