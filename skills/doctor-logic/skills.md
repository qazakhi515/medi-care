`name`: `doctor-logic

`description`:
`Review Medi-care doctor API consistency across GraphQL operations, DTOs, schemas, enums, filters, member references, and legacy terminology.`

# Medi-care Doctor API Review

Use this skill for review-only passes or pre-edit analysis of the doctor API.

# Review Checklist

- Confirm GraphQL operation names use doctor terminology:
  - createDoctor
  - getDoctor
  - getDoctors
  - and related doctor operations.
- Confirm doctors.memberId references members.\_id.
- Confirm doctor users are represented by MemberType.DOCTOR.
- Confirm doctor profile data is not stored directly in members.
- Confirm DTOs, schemas, enums, and filters agree on doctor fields and nullability.
- Confirm enum values are consistent:
  doctorStatus: ACTIVE, PENDING, BLOCK, DELETE
  specialization: UROLOGY, DERMATOLOGY, PEDIATRICS, SURGERY, DENTISTRY, CARDIOLOGY, ORTHOPEDICS, OPHTHALMOLOGY, OTHER
- Confirm licenseNumber is string, and experienceYears, consultationFee, doctorRank, doctorViews are numeric.
- Confirm hospitalId and languages are not added to doctors.
- Report real findings with paths and behavior impact.
