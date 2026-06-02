# Medi-care Backend Agent Instruction

Medi-care is a NestJS GraphQL monorepo migrated from a Nestar real-estate platform into a healthcare platform focused on hospitals, doctors, doctor schedules, patient appointments, payments and patient profiles.

## Read First

Before changing code, read the current AI handoff docs:

- `docs/ai/BACKEND_MIGRATION.md`
- `docs/ai/DECISIONS.md`
- `docs/ai/COMPLETED_TASKS.md`
- `docs/ai/NEXT_STEPS.md`

Use those files as the source of truth for AI Agent related migration history, accepted decisions, remaining work and validation status.

## Project Shape

- Backend apps should follow the existing API and batch app pattern.
- If the apps are already renamed, use `medicare-api` and `medicare-batch`.
- If the apps still use old names, keep the current paths working and document the rename as migration work.
- Keep the existing NestJS resolver/service/module pattern based on MVC and DI.
- Keep DTOs, enums, schemas, filters and shared types under the existing `apps/*/src/libs` structure.
- Keep shared modules reusable: auth, member, hospital, doctor, doctor schedule, appointment, payment, patient profile, like, view, comment, follow, board article, notification and socket.

## Domain Rules

- Use Medi-care healthcare terminology for migrated backend code.
- Do not reintroduce property, real-estate, product, petshop or agent ownership terminology into healthcare workflows.
- Hospitals remain the care-room/catalog-style entity.
- Doctors are professional profiles linked to members.
- Appointments are bookings between patients and doctors.
- Payments belong to appointments.
- Patient profiles extend member accounts with medical profile data.
- Doctor schedules define doctor availability; appointments reserve actual time slots.

## Member Rules

- Keep `members` as the base account collection.
- `MemberType` values are:
  - `PATIENT`
  - `NURSE`
  - `DOCTOR`
  - `ADMIN`
- Do not store a direct `doctor` ObjectId field inside `members`.
- Doctor profile ownership must use `doctors.memberId`.

## ER Model Rules

- `doctors.memberId` references `members._id`.
- `doctorSchedules.doctorId` references `doctors._id`.
- `appointments.patientId` references `members._id`.
- `appointments.doctorId` references `doctors._id`.
- `payments.appointmentId` references `appointments._id`.
- `payments.patientId` references `members._id`.
- `payments.doctorId` references `doctors._id`.
- `patientProfiles.memberId` references `members._id`.
- Do not add `hospitalId` to doctors or appointments unless a later migration explicitly changes this decision.
- Do not add `currency` or `transactionId` to payments unless a later migration explicitly changes this decision.
- Do not add reviews or redesign notifications as part of appointment/payment migration work.

## Healthcare Enums

- `doctorStatus`: `ACTIVE`, `PENDING`, `BLOCK`, `DELETE`
- `specialization`: `UROLOGY`, `DERMATOLOGY`, `PEDIATRICS`, `SURGERY`, `DENTISTRY`, `CARDIOLOGY`, `ORTHOPEDICS`, `OPHTHALMOLOGY`, `OTHER`
- `scheduleStatus`: `ACTIVE`, `INACTIVE`, `DELETE`
- `dayOfWeek`: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`
- `appointmentStatus`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- `paymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `paymentMethod`: `CASH`, `CARD`, `CLICK`, `PAYME`
- `gender`: `MALE`, `FEMALE`
- `bloodType`: `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE`

## Workflow

1. Analyze before editing.
2. Keep changes small and consistent with existing project patterns.
3. Migrate one healthcare workflow at a time.
4. Do not remove working logic unless it is replaced safely.
5. Update `docs/ai/COMPLETED_TASKS.md` after major completed work.
6. Add or update focused tests when behavior changes.

## Validation

Use these checks for backend work:

```bash
npx tsc -p apps/medicare-api/tsconfig.app.json --noEmit
npx tsc -p apps/medicare-batch/tsconfig.app.json --noEmit
npm run build
```

If the repository still uses old app names, run the equivalent current app `tsconfig.app.json` checks and document the naming mismatch.

`npm run lint` may run ESLint with `--fix`, so use it only when file rewriting is acceptable.
