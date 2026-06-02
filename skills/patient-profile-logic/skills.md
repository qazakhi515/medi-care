`name`:`patient-profile-logic`

`description`:
`Review Medi-care patient profile API consistency across GraphQL operations, DTOs, schemas, enums, member references, and medical profile fields.`

# Medi-care Patient Profile API Review

Use this skill for review-only passes or pre-edit analysis of patient profile logic.

# Review Checklist

- Confirm GraphQL operation names use patient profile terminology:
  - createPatientProfile
  - getPatientProfile
  - getPatientProfiles
  - updatePatientProfile
  - and related profile operations.
- Confirm patientProfiles.memberId references members.\_id.
- Confirm patient profile extends member account data and does not replace auth/member fields.
- Confirm birthDate is date, not int.
- Confirm gender enum values are MALE, FEMALE, OTHER.
- Confirm bloodType enum values are A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE.
- Confirm chronicDiseases naming is used instead of generic diseases in migrated code.
- Confirm allergies is not added.
- Report real findings with paths and behavior impact.
