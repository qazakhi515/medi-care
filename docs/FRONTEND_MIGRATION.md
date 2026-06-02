# Frontend Migration Plan — Nestar → Medi-care (Next.js)

> Forward-looking plan for the Next.js client. The backend Phase 1 rename does **not** break the frontend (API URLs/ports and GraphQL schema are unchanged), so this work can proceed independently and incrementally.
> Last updated: 2026-06-02

> ⚠️ Assumption: the frontend is a separate Next.js repo following the standard Nestar course layout (pages router, Apollo Client, MUI). Adjust paths to the actual repo. This plan is written to be applied once the backend Phase 2 domain remap is agreed (see `DECISIONS.md` ADR-006).

---

## 1. Step-by-Step Migration Plan

| # | Step | Depends on |
|---|---|---|
| 1 | **Branding pass** — rename app title, logo, metadata, favicon, theme tokens `Nestar → Medi-care`. No API impact. | — |
| 2 | **Terminology pass** — replace user-facing real-estate copy with clinical copy (see §4). | Step 1 |
| 3 | **Route/page remap** — rename route folders and page components (see §2). Add redirects from old routes. | Backend Phase 2 decision |
| 4 | **GraphQL document remap** — rename queries/mutations/fragments to match new backend names; regenerate types. | Backend Phase 2 GraphQL renames merged |
| 5 | **Component remap** — rename and re-field domain components (cards, forms, detail panels). | Steps 3–4 |
| 6 | **Enum/select remap** — replace `PropertyType/Location` dropdowns with `Specialty/Department`. | Step 4 |
| 7 | **Auth/role UI** — swap `AGENT` UI affordances for `DOCTOR`; add patient booking UI. | Backend role rename |
| 8 | **Codegen + typecheck + e2e** — run GraphQL codegen, `tsc`, Cypress/Playwright smoke. | All above |

> **Sequencing rule:** Steps 1–2 (cosmetic) can ship immediately. Steps 3–7 must land **in lockstep with the matching backend Phase 2 PR** to avoid a broken client.

---

## 2. Page / Route Mapping

| Nestar (real-estate) | Medi-care (hospital) | Notes |
|---|---|---|
| `/property` (list) | `/doctor` (doctor directory) | listing → provider directory |
| `/property/detail?id=` | `/doctor/detail?id=` | listing detail → doctor profile |
| `/mypage` (agent listings) | `/mypage` (doctor profile + schedule) | role-gated section changes |
| `/agent` (agent directory) | `/doctor` or `/department` | agents → doctors/departments |
| `/community` (board articles) | `/health-articles` | health content/blog |
| `/cs` (FAQ/notice) | `/cs` | mostly unchanged |
| `/account/join`, `/account/login` | same | copy/terminology only |
| — (none) | `/appointment` (booking + my appointments) | **new** page, no Nestar analog |

> Add Next.js `redirects()` in `next.config.js` mapping old paths to new ones for one release.

---

## 3. Component Mapping

| Nestar component | Medi-care component | Change type |
|---|---|---|
| `PropertyCard` | `DoctorCard` | rename + re-field (price→fee, beds→specialty) |
| `PropertyList` | `DoctorList` | rename |
| `PropertyDetail` | `DoctorProfile` | rename + re-field |
| `PropertyFilter` (type/location/price) | `DoctorFilter` (specialty/department/fee) | enum-driven fields swap |
| `AgentCard` | `DoctorCard` | merge/rename |
| `CommunityBoard` | `HealthArticles` | rename, theme |
| `CommentBox` | `ReviewBox` | rename (reviews) |
| `LikeButton` / `FavoriteButton` | unchanged behavior, label "Save doctor" | terminology only |
| `FollowButton` | `FollowDoctorButton` | terminology only |
| `ChatModal` (socket) | `ChatModal` | unchanged behavior (patient↔doctor) |
| — | `AppointmentForm`, `AppointmentList` | **new** |

---

## 4. GraphQL Query / Mutation Rename Plan

> Apply **only after** the backend exposes the new names (Phase 2). Until then the frontend keeps the current names and works against the unchanged schema.

| Current document | Planned document | Type |
|---|---|---|
| `GET_PROPERTIES` | `GET_DOCTORS` | query |
| `GET_PROPERTY` | `GET_DOCTOR` | query |
| `GET_AGENT_PROPERTIES` | `GET_DOCTOR_PROFILES` | query |
| `GET_FAVORITES` | `GET_FAVORITES` (same, returns doctors) | query |
| `GET_VISITED` | `GET_VISITED` (same) | query |
| `CREATE_PROPERTY` | `CREATE_DOCTOR` | mutation |
| `UPDATE_PROPERTY` | `UPDATE_DOCTOR` | mutation |
| `LIKE_TARGET_PROPERTY` | `LIKE_TARGET_DOCTOR` | mutation |
| `GET_ALL_PROPERTIES_BY_ADMIN` | `GET_ALL_DOCTORS_BY_ADMIN` | query |
| — | `BOOK_APPOINTMENT`, `GET_APPOINTMENTS`, `CANCEL_APPOINTMENT` | **new** |

**Process:**
1. Update `.graphql`/gql documents to new names + field selections.
2. Re-run GraphQL codegen (`graphql-codegen`) to regenerate hooks/types.
3. Fix type errors surfaced by codegen.
4. Update enum imports (`PropertyType` → `Specialty`, etc.).

---

## 5. UI Terminology Changes

| Real-estate term | Hospital term |
|---|---|
| Property / Listing | Doctor / Doctor profile |
| Agent | Doctor |
| User | Patient |
| Buy / Rent | Book appointment / Consult |
| Price | Consultation fee |
| Beds / Rooms / Square | Specialty / Department / Experience |
| Location (Seoul, Busan…) | Department / Clinic |
| Favorites | Saved doctors |
| Follow agent | Follow doctor |
| Community / Board | Health articles |
| Comments | Reviews |
| "For sale" / "Sold" | "Accepting patients" / "Fully booked" |

---

## 6. Risks & Guardrails

- **Schema drift:** never rename frontend GraphQL docs ahead of the backend — codegen will fail. Gate on the backend Phase 2 merge.
- **SEO / bookmarks:** add `redirects()` for renamed routes for at least one release.
- **Mixed vocabulary window:** ship cosmetic steps (1–2) early so users see "Medi-care" before the deeper remap completes.
- **No backend logic assumption:** appointment booking is a **new** capability with no Nestar analog — budget design time for slots, availability, and conflicts.
