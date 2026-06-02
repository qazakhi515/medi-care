`name`: `hospital-logic`

`description`:
`Review Medi-care hospital API consistency across GraphQL operations, DTOs, schemas, enums, filters, and legacy terminology.`

# Medi-care Hospital API Review

- Use this skill for review-only passes or pre-edit analysis of the hospital API.

# Review Checklist

- Confirm GraphQL operation names use hospital terminology:
  - createHospital
  - getHospital
  - getHospitals
  - and related hospital operations.
- Confirm DTOs, schemas, enums, and filters agree on hospital fields and nullability.
- Confirm hospital ownership uses memberId unless a later decision changes it.
- Confirm old property, realEstate, car, product, or agent terminology is not used in migrated hospital logic.
- Confirm appointments are not coupled to hospitalId; current ER model keeps appointment booking doctor-based.
- Confirm shared like, view, comment, notification, and board article behavior remains compatible.
- Report real findings with paths and behavior impact.
