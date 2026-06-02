`name`:`er-model-validation`

`description`: `Validate Medi-care ER model consistency across schemas, DTOs, enums, references, indexes, and old-domain terminology.`

# Medi-care ER Model Review

Use this skill for review-only passes before or after schema-sensitive changes.

# Review Checklist

- Confirm members.memberType includes DOCTOR.
- Confirm members does not contain a direct doctor ObjectId field.
- Confirm references:
  - doctors.memberId -> members.\_id
  - doctorSchedules.doctorId -> doctors.\_id
  - appointments.patientId -> members.\_id
  - appointments.doctorId -> doctors.\_id
  - payments.appointmentId -> appointments.\_id
  - payments.patientId -> members.\_id
  - payments.doctorId -> doctors.\_id
  - patientProfiles.memberId -> members.\_id
- Confirm old property, real-estate, product, petshop, car, and agent terminology is not used in migrated healthcare workflows.
- Confirm doctor/appointment do not use hospitalId.
- Confirm payments do not use currency or transactionId.
- Confirm reviews and notification redesign are not added unless explicitly requested.
- Report real findings with paths and behavior impact.
