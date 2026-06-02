`name`: `payment-logic`

`description`: Review Medi-care payment API consistency across GraphQL operations, DTOs, schemas, enums, appointment references, and payment rules.

# Medi-care Payment API Review

`Use this skill for review-only passes or pre-edit analysis of appointment payment logic.`

# Review Checklist

- Confirm GraphQL operation names use payment terminology:
  - createPayment
  - getPayment
  - getPayments
  - updatePayment
  - and related payment operations.
- Confirm payments.appointmentId references appointments.\_id.
- Confirm payments.patientId references members.\_id.
- Confirm payments.doctorId references doctors.\_id.
- Confirm one payment record per appointment unless a later decision changes this rule.
- Confirm paymentStatus enum values are PENDING, PAID, FAILED, REFUNDED.
- Confirm paymentMethod enum values are CASH, CARD, CLICK, PAYME.
- Confirm currency and transactionId are not added.
- Confirm paidAt is nullable until payment succeeds.
- Report real findings with paths and behavior impact.
