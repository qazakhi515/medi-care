# Appointment Logic Skill

name: appointment-logic

description: Review Medi-care appointment API consistency across GraphQL operations, DTOs, schemas, enums, filters, doctor booking rules, and references

# Medi-care Appointment API Review

Use this skill for review-only passes or pre-edit analysis of appointment booking.

# Review Checklist

- Confirm GraphQL operation names use appointment terminology:
  - createAppointment
  - getAppointment
  - getAppointments
  - updateAppointment
  - and related booking operations.
- Confirm appointments.patientId references members.\_id.
- Confirm appointments.doctorId references doctors.\_id.
- Confirm appointments do not use an extra members ObjectId field.
- Confirm appointments do not use hospitalId.
- Confirm appointmentStatus is enum, not free string:
  - PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- Confirm booking logic prevents duplicate doctor slots with doctorId + appointmentDate + startTime.
- Confirm startTime and endTime are handled consistently as time strings.
- Report real findings with paths and behavior impact.
