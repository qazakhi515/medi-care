# Completed Tasks — This Session

> Session date: 2026-06-02
> Scope delivered: **Phase 1 — safe rename layer (Nestar → Medi-care)** + repo analysis + documentation.

---

## Doctor detail page enhancement (session 2026-06-08) — frontend only

> Skill `doc/skills/doctor-detail`. Only `pages/doctor/detail.tsx` changed; dynamic data only, no API/route/other-page changes.

- Restructured into sections: **Introduction** (animated photo, name, specialty, bio from `memberData.memberDesc`, experience years), **Education** (`education` + `certificates` + `licenseNumber`, with empty state), **Work Experience** (`experienceYears` + current workplace resolved from the linked hospital via `GET_HOSPITAL` on `doctor.hospitalId`). Existing Weekly Availability + Book button preserved.
- **Photo animation:** framer-motion fade/scale-in + subtle hover scale on the avatar.
- **Background:** soft olive brand gradient (`#f6f7f3 → #eef0e9`), white cards, responsive (column on mobile).
- No structured university/degree/previous-workplace fields exist, so only real fields are shown (no hardcoded doctor-specific content). Outer gradient wrapper uses a native `div` to avoid MUI `sx` TS2590.
- Validation: `tsc --noEmit` ✅ 0; `yarn build` ✅ (`/doctor/detail` 5.33 kB); dev 200, no errors.

---

## Hospital detail page fix (session 2026-06-08) — frontend only

> Skill `doc/skills/hospital-detail-page`. Minimal, additive; no API/routes/other pages touched.

- **Broken image layout & misaligned icons:** root cause = same property→hospital SCSS mismatch as the list page. Renamed 5 dead selectors in `scss/pc/property/detail.scss`: `#property-detail-page`→`#hospital-detail-page`, `.property-detail-config`→`.hospital-detail-config`, `.property-info-config`→`.hospital-info-config`, `.property-desc-config`→`.hospital-desc-config`, `.similar-properties-config`→`.similar-hospitals-config` (no TSX referenced the old names; nested classes already matched) → page now fully styled.
- **Gallery autoplay:** `HospitalGallery.tsx` now auto-slides horizontally every 4s (framer-motion `useMotionValue`+`animate`+interval) while keeping drag/swipe; wrapper Boxes converted to native divs to dodge MUI `sx` TS2590.
- **New section:** `HospitalEquipment.tsx` — generic professional copy + dynamic facility stats (`hospitalType` always; `hospitalBeds`/`hospitalRooms`/`hospitalSquare` when present). No hardcoded hospital-specific content.
- **Order:** `HospitalDetailSections` now renders Introduction(About) → Gallery → Equipment → Doctor Schedule → Address&Map.
- Validation: `tsc --noEmit` ✅ 0; `yarn build` ✅; dev `/hospital/detail` 200, no errors.

---

## Doctor ↔ Hospital link (session 2026-06-08) — implements ADR-009

> Scope: add an optional single-FK `doctors.hospitalId → hospitals._id` so the hospital detail UI can list a hospital's doctors. Follows existing doctor-module patterns. **Appointments untouched** (still doctor-based, no `hospitalId`).

### Backend (`apps/medicare-api`)
| File | Change |
|---|---|
| `schemas/Doctor.model.ts` | add optional `hospitalId` (ObjectId, `ref: 'Hospital'`) + non-unique index `{ hospitalId: 1 }` |
| `libs/dto/doctor/doctor.input.ts` | `DoctorInput` + `DISearch` gain optional `hospitalId` (`@Field(() => String, { nullable: true })`) |
| `libs/dto/doctor/doctor.update.ts` | `DoctorUpdate` gains optional `hospitalId` |
| `libs/dto/doctor/doctor.ts` | `Doctor` ObjectType gains `hospitalId` + `hospitalData?` (from aggregate) |
| `libs/config.ts` | new `lookupHospital` (`$lookup` hospitals/hospitalId), mirroring `lookupMember` |
| `components/doctor/doctor.service.ts` | inject Hospital model; `assertHospitalExists`; `createDoctor`/`updateDoctor` validate ref; `getDoctors` adds `hospitalId` match + `lookupHospital` + preserve-null unwind |
| `components/doctor/doctor.module.ts` | register `Hospital` schema in `MongooseModule.forFeature` |

### Frontend (`Medi-care-next`)
- Types: `hospitalId?` on `DISearch`/`DoctorInput`; `hospitalId?` + `hospitalData?` on `Doctor`.
- GraphQL: `hospitalId` added to `GET_DOCTORS`, `GET_DOCTOR`, `CREATE_DOCTOR`, `UPDATE_DOCTOR`.
- `pages/doctor/manage.tsx`: Hospital `<select>` (from `GET_HOSPITALS`); set on create, and an "Save hospital" update path for existing profiles.
- `libs/components/hospital/HospitalDetailSections.tsx`: `GET_DOCTORS` now filters `search.hospitalId = hospital._id` → About→Doctors + Doctor Schedule show only that hospital's doctors.

### Validation (2026-06-08)
| Check | Result |
|---|---|
| `npx tsc -p apps/medicare-api/tsconfig.app.json --noEmit` | ✅ 0 |
| backend `npm run build` | ✅ webpack compiled |
| API restarted on :3007; introspection | ✅ `getDoctors` accepts `search.hospitalId` and returns `hospitalId` (null for the 3 pre-existing doctors) |
| frontend `npx tsc --noEmit` / `yarn build` | ✅ 0 / all pages |

> Existing doctors have `hospitalId = null` until assigned (via doctor manage UI or an authenticated `updateDoctor`). `updateDoctor` is `@Roles(DOCTOR)` auth-gated, so the assign-and-verify step runs through a logged-in doctor session.

---

## FRONTEND hospitals-page + add-hospital fixes — Medi-care-next (session 2026-06-08)

> Scope: targeted bug fixes on the Hospitals list page, its Filter, and the doctor "Add Hospital" form. No backend/API or unrelated logic changed. Validated with Yarn + live backend.

| Issue | Fix |
|---|---|
| Hospitals list page unstyled (leftover property→hospital class mismatch) | `scss/pc/property/property.scss`: renamed dead selectors to the live names — `#property-list-page`→`#hospital-list-page`, `.property-page`→`.hospital-page`, `.property-location`→`.hospital-location`, `.property-checkbox`→`.hospital-checkbox`, `.property-type`→`.hospital-type` (no TSX referenced the old names). |
| Sort control on the right | Same file: list-page `.right` → `left: 0; right: auto;`. |
| "Hospital Type" label shown twice in Filter | `libs/components/hospital/Filter.tsx`: removed the upper `<Typography className="title">Hospital Type</Typography>`; kept the Select's `InputLabel`. |
| Doctor couldn't add a hospital; barter/rent/rooms/bed/square unwanted; price showed NaN | `libs/components/mypage/AddNewHospital.tsx`: removed those 5 field UI blocks; trimmed `doDisabledCheck` to title/price(>0,!NaN)/type/location/address/desc/images; price onChange guards `isNaN`→0 and displays `''` for 0; added `skip: !router.query.hospitalId` to `GET_HOSPITAL`. **API unchanged** — `hospitalBeds/Rooms/Square` (0) and `hospitalBarter/Rent` (false) still sent from `initialValues` so `CREATE/UPDATE_HOSPITAL` inputs stay valid. |

### Validation (2026-06-08)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `yarn build` | ✅ all pages compile |
| Live backend (`:3007`) `getHospitals` | ✅ returns hospitals (data was never the issue — layout was) |
| Dev smoke `/hospital`, `/mypage` | ✅ 200, no compile/runtime errors |

> Doctor create-hospital submit should be confirmed in-browser (auth required). If the backend enforces a hidden `@Min(1)` on beds/rooms/square, bump those hidden defaults from 0→1.

---

## FRONTEND hospital-detail sections — Medi-care-next (session 2026-06-08)

> Scope: 4 **purely additive** sections on the hospital detail page per the `hospital-detail-ui` skill (`doc/skills/hospital-datail-ui`). No existing layout, styles, queries, business logic, or features changed. Validated with Yarn.

### What changed
| Area | Change |
|---|---|
| New components | `libs/components/hospital/`: `HospitalDetailSections.tsx` (orchestrator), `HospitalAbout.tsx`, `HospitalDoctorSchedule.tsx`, `HospitalGallery.tsx`, `HospitalLocationMap.tsx`. All self-contained, styled with MUI `sx`/inline (Medi-care olive palette) — **no global SCSS touched**. |
| Page edit | `pages/hospital/detail.tsx`: **only** added one import + `{hospital && <HospitalDetailSections hospital={hospital} />}` after the existing `similar-hospitals-config` block (detail.tsx:644). Nothing else in the page changed. |
| About Hospital | Renders `hospitalDesc` + a Doctors subsection reusing existing `DoctorCard`. |
| Doctor Schedule | Doctor switcher chips + weekly working hours, replicating the pattern from `pages/doctor/detail.tsx:90-104` via `GET_DOCTOR_SCHEDULES` (search by `doctorId`). |
| Hospital Gallery | `framer-motion` horizontal drag/swipe gallery over `hospitalImages` (`REACT_APP_API_URL` prefix); responsive; graceful empty-state. |
| Address & Map | Address/location/contact + keyless embedded map iframe `https://www.google.com/maps?q=<hospitalAddress>&output=embed`. The page's pre-existing hardcoded iframe was left untouched. |
| Dependency | `yarn add framer-motion` → `framer-motion@12.40.0` (React-18 compatible). |
| Doctors data | `GET_DOCTORS` with `search:{ doctorStatus: ACTIVE }`, sort `doctorRank` DESC, limit 8 — fetched once in the orchestrator and passed to About + Schedule. |

### Backend dependency (documented, not invented)
- **No hospital↔doctor relation exists** (`DISearch` = `doctorStatus` / `specializationList` / `text` only; neither `Doctor` nor `Hospital` carries a cross-reference). So the About/Schedule sections show **platform-wide active doctors**, not doctors of *this* hospital, with a visible caption saying linkage is pending backend support. Per ER model + AGENTS.md, appointments stay doctor-based and **no `hospitalId` was added** anywhere. When the backend exposes a hospital→doctor relation, swap the `GET_DOCTORS` filter to scope by hospital — no other change needed.

### Known limitation (pre-existing, not in scope)
- `pages/hospital/detail.tsx` mobile branch is a placeholder (`<div>HOSPITAL DETAIL PAGE</div>`). Left as-is; the new sections are internally responsive but render under the desktop branch. Building the mobile page is a separate task.

### Validation (2026-06-08)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 (after fixing a MUI TS2590 union-depth issue in `HospitalAbout` by using native layout wrappers) |
| `yarn build` | ✅ all pages; `/hospital/detail` compiles (13.3 → 57.2 kB w/ framer-motion) |
| Dev smoke (`/hospital/detail`) | ✅ 200, no compile/runtime errors; sections degrade gracefully to `null`/empty-states without data |

> **Not committed** — left in working tree for user review.

---

## FRONTEND homepage redesign — Medi-care-next (session 2026-06-07)

> Scope: incremental, calm clinic-style homepage redesign per the `homepage-design` skill. Architecture, GraphQL/Apollo integration and existing pages preserved. No backend changes. Validated with Yarn.

### What changed
| Area | Change |
|---|---|
| Hero | New `libs/components/homepage/MediHero.tsx` — full-width clinic hero (real hospital image `public/img/medi/hero.jpg`), muted-olive overlay, headline, hospital search entry (routes to `/hospital`), `Find a Hospital` + `Book Appointment` CTAs. Replaces the inherited three.js `FiberContainer` image-scroller + real-estate `HeaderFilter` in `LayoutHome` (both files **kept**, just unused → reversible). Hero now shows on mobile + desktop. |
| Quick nav | New `QuickNav.tsx` — 4 calm tiles: Hospitals `/hospital`, Doctors `/doctor`, Appointments `/appointment`, My Profile `/patient-profile`. |
| Popular Hospitals | Section kept (`PopularHospitals.tsx`, `GET_HOSPITALS`) with clinic copy ("Popular Hospitals" / "See All Hospitals"). `PopularHospitalCard.tsx` re-fielded: **dropped real-estate `$price` / rent-sale wording**; now shows title, location, beds/rooms, views, `View Hospital` CTA, with a safe image fallback (`/img/medi/hospital-fallback.jpg`). |
| Famous Doctors | New `FamousDoctors.tsx` — uses existing `GET_DOCTORS` + `DoctorCard` (links `/doctor/detail`); Swiper carousel, empty-state fallback. Replaces the old `TopAgents` (members) section. |
| Appointment CTA | New `AppointmentCTA.tsx` — closing band → `/appointment`. |
| Homepage | `pages/index.tsx` now renders only: `QuickNav` → `Popular Hospitals` → `Famous Doctors` → `AppointmentCTA`. **Removed from homepage:** `TrendHospitals`, `TopHospitals`, `TopAgents`, `Advertisement`, `Events`, `CommunityBoards` (component files left in repo, unused). |
| Styles | New `scss/pc/homepage/medicare-home.scss` (muted olive/green-gray palette, soft white space, responsive 1024/768 breakpoints, fixed px type — no vw). Imported **last** in `scss/pc/main.scss` so it overrides the legacy `.header-main` + unstyled `.popular-hospitals`. Curated imagery added under `public/img/medi/`. |

### Intentionally kept
- All GraphQL documents / Apollo wiring unchanged (only reused `GET_HOSPITALS`, `GET_DOCTORS`).
- Legacy homepage components and `FiberContainer`/`HeaderFilter` left in the tree (not deleted) for safe rollback.
- `Hospital` backend fields (`hospitalBeds/Rooms`, etc.) untouched — only the **UI** stopped surfacing the real-estate ones.

### Backend / data dependency (documented, not invented)
- **Hospital ↔ Doctor linkage is not in the schema.** `Famous Doctors` lists doctors globally via `GET_DOCTORS`; the hospital-detail "doctors at this hospital" view cannot be wired until the backend exposes a hospital→doctor relation. Per ER model + AGENTS.md, appointments stay **doctor-based** (no `hospitalId` added). Hospital-detail clinic layout (overview, gallery, doctor list, schedule, map) remains a follow-up once that linkage exists.

### Validation (2026-06-07)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 |
| `yarn build` | ✅ 91/91 pages; `/` builds clean (4.03 kB) |

> **Not committed** — left in working tree for user review.

---

## FRONTEND migration — Medi-care-next (session 2026-06-07)

> Repo: `Medi-care-next` (Next.js pages router, Apollo Client, MUI, **no graphql-codegen**, **Yarn**).
> Scope: align the broken real-estate client to the already-migrated backend, rebrand, and add the 5 clinical domains as UI.

### Key discovery
The backend GraphQL surface had **already** renamed `Property → Hospital`, roles → `PATIENT/NURSE/DOCTOR/ADMIN`, `memberProperties → memberHospitals`, `CommentGroup PROPERTY → HOSPITAL`, and added the 5 clinical domains — so the frontend (still on the old names) was **broken against the live backend**. Verified via introspection against `localhost:3007`. (This supersedes the "Property→Hospital deferred" note above for the **frontend**; the backend rename is live.)

### Phase 1 — restore working app (Property→Hospital + roles)
| Area | Change |
|---|---|
| Enums | `property.enum.ts → hospital.enum.ts` (17 `HospitalType`, `HospitalStatus` = ACTIVE/DELETE only — **SOLD dropped**, 9 `HospitalLocation`); `member.enum.ts` → `PATIENT/NURSE/DOCTOR/ADMIN`; `like`/`comment`/`view` `PROPERTY → HOSPITAL` |
| Types | `libs/types/property/ → hospital/` (triad renamed); `Property→Hospital`, `propertyX→hospitalX`, added `hospitalComments`, **removed `soldAt`**; `member.ts`/`customJwtPayload.ts` `memberProperties→memberHospitals` |
| GraphQL docs | `apollo/user|admin/*`: `getProperties→getHospitals`, `getAgentProperties→getAgentHospitals`, `getAllPropertiesByAdmin→getAllHospitalsByAdmin`, `createProperty→createHospital`, `likeTargetProperty→likeTargetHospital`, etc.; removed `soldAt`; `memberProperties→memberHospitals` |
| Components | `git mv` + re-field: `property/ → hospital/` (`PropertyCard→HospitalCard`), `PropertyBigCard→HospitalBigCard`, mypage `MyProperties→MyHospitals`/`AddNewProperty→AddNewHospital`/`PropertyCard→HospitalCard`, `MemberProperties→MemberHospitals`, homepage `*Properties→*Hospitals`, admin `properties/PropertyList → hospitals/HospitalList`; removed all SOLD UI |
| Pages/routes | `pages/property → pages/hospital`, `pages/_admin/properties → pages/_admin/hospitals`; role values `USER→PATIENT`/`AGENT→DOCTOR` (join + admin users + role gates); `next.config.js` redirects `/property→/hospital` |
| Config/plumbing | `config.ts` (`availableOptions`, `hospitalSquare`, `topHospitalRank`), `utils.ts` (`likeTargetHospitalHandler`), `apollo/store.ts` + `libs/auth/index.ts` (`memberHospitals`) |

### Phase 2 — branding + i18n
`package.json` name `nestar-next → medicare-next`; `_document.tsx` SEO meta → healthcare; `public/locales/{en,kr,ru}/common.json` values → Hospitals/Doctors/etc. (keys kept); nav (`Top.tsx`) → `/doctor` + Appointments; display strings + join role labels.

### Phase 3 — new clinical domains (additive UI)
- **Enums:** `doctor`, `schedule`, `appointment`, `payment`, `patient-profile`.
- **Types:** triads under `libs/types/{doctor,doctor-schedule,appointment,payment,patient-profile}/`.
- **GraphQL:** `GET_DOCTOR(S)`, `CREATE/UPDATE_DOCTOR`, `GET_DOCTOR_SCHEDULES`, `CREATE/UPDATE/REMOVE_DOCTOR_SCHEDULE`, `GET_APPOINTMENT(S)`, `CREATE/UPDATE_APPOINTMENT`, `GET_PAYMENTS`, `CREATE_PAYMENT`, `GET_PATIENT_PROFILE`, `CREATE/UPDATE_PATIENT_PROFILE`.
- **Components/pages:** `DoctorCard`; `/doctor` (directory), `/doctor/detail` (profile + weekly schedule + book CTA), `/doctor/manage` (DOCTOR-only: create profile + manage schedule); `appointment/SlotPicker` + `/appointment` (slot-based booking from schedules + my appointments); `/payment` (pay per appointment + history); `/patient-profile` (self medical profile).
- **Notes:** `/agent` member-profile pages kept (non-destructive); nav "Doctors" now → `/doctor`. Doctor resolves own `doctorId` by matching `memberData._id` (no `getMyDoctor` query exists). Booking is best-effort client-side; backend unique `{doctorId,date,startTime}` is authoritative.

### Validation (2026-06-07)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 (after each phase) |
| `yarn build` | ✅ 91/91 pages generated (incl. all clinical routes) |
| GraphQL smoke vs `localhost:3007` | ✅ `getHospitals`, `getAgents` (memberHospitals), `getDoctors`, `getDoctorSchedules`, `getAppointments` (shape-valid, auth-gated) |
| Residual real-estate functional tokens | ✅ none (`getProperties`/`soldAt`/`PropertiesInquiry` gone) |

> **Not committed** — changes left in working tree pending user review. Remaining cosmetic copy (hardcoded "Agent"/"property" CSS class names/labels in some components) intentionally deferred.

---

## Phase 2 — Member roles + 5 healthcare domains (session 2026-06-03)

> Scope: canonical `MemberType` migration + the five new domains keyed off `DOCTOR`
> (`Doctor`, `DoctorSchedule`, `Appointment`, `Payment`, `PatientProfile`), per `AGENTS.md`.
> `Property → Hospital` rename intentionally deferred (separate workflow).

### A. MemberType `USER/AGENT/ADMIN → PATIENT/NURSE/DOCTOR/ADMIN`
| File | Change |
|---|---|
| `libs/enums/member.enum.ts` | enum values → `PATIENT/NURSE/DOCTOR/ADMIN` |
| `schemas/Member.model.ts` | default `USER → PATIENT` |
| `components/member/member.service.ts` | `getAgents` match `AGENT → DOCTOR` |
| `components/member/member.resolver.ts` | `checkAuthRoles` roles `USER,AGENT → PATIENT,DOCTOR` |
| `components/property/property.resolver.ts` | 3× `@Roles(AGENT) → DOCTOR` (mechanical placeholder until Hospital rename) |
| `medicare-batch/src/batch.service.ts` | 2× `AGENT → DOCTOR` |
| `medicare-batch/src/migrations/2026-06-rename-member-types.migration.ts` | **new** data migration: `USER→PATIENT`, `AGENT→DOCTOR` on `members` (run once) |

### B. New enums (verbatim from AGENTS.md)
`doctor.enum.ts` (DoctorStatus, Specialization), `schedule.enum.ts` (ScheduleStatus, DayOfWeek), `appointment.enum.ts` (AppointmentStatus), `payment.enum.ts` (PaymentStatus, PaymentMethod), `patient-profile.enum.ts` (Gender, BloodType); added `DOCTOR` to `ViewGroup`; added 4 `Message` constants.

### C. Five new domains (schema + DTO triad + service + resolver + module each)
- **doctor** — `doctors.memberId → members._id`; unique `memberId` & `licenseNumber`; view counting (`ViewGroup.DOCTOR`); default status `PENDING`.
- **doctor-schedule** — `doctorSchedules.doctorId → doctors._id`; unique `{doctorId,dayOfWeek,startTime}`; ownership check via `doctors.memberId`.
- **appointment** — `patientId → members._id`, `doctorId → doctors._id`; unique `{doctorId,appointmentDate,startTime}` (double-booking guard) + service pre-check; no `hospitalId`.
- **payment** — `appointmentId`(unique)→appointments, `patientId`→members, `doctorId`→doctors; one-per-appointment; amount derived from doctor `consultationFee`; no `currency`/`transactionId`.
- **patient-profile** — `patientProfiles.memberId → members._id`; unique `memberId` (one per member).

### D. Wiring & batch
`components.module.ts` imports all 5 modules; `config.ts` adds sort arrays + `lookupDoctor`/`lookupPatient`; batch adds `batchDoctors` job (cron `50 * * * * *`) + `doctorRank` rollback + `Doctor` schema registration.

### Validation (2026-06-03)
| Check | Result |
|---|---|
| `tsc --noEmit` (api) | ✅ exit 0 |
| `tsc --noEmit` (batch) | ✅ exit 0 |
| `npm run build` | ✅ webpack compiled successfully |
| Runtime boot (`node dist/apps/medicare-api/main.js`) | ✅ all 5 new modules initialized; `GraphQLModule` mapped `/graphql` (code-first schema built, no duplicate-type errors); `Nest application successfully started` (only port 3007 EADDRINUSE from an already-running server — unrelated) |
| Real-estate leak scan on new files | ✅ none |
| Duplicate `@InputType` class names | ✅ none (renamed `AISearch→ApptISearch`, `PISearch→PayISearch` to avoid collisions with member/property) |

> **Not yet run:** the `members` data migration (`2026-06-rename-member-types.migration.ts`) against the dev DB, and GraphQL playground smoke tests — pending user go-ahead.

---

## 1. Repo Analysis (no changes)

- Mapped the monorepo: NestJS GraphQL, two apps (`*-api` @ 3007, `*-batch` @ 3008), Apollo 4, Mongoose 8, JWT, WebSocket chat, batch scheduler.
- Catalogued 8 domains (`member`, `property`, `board-article`, `comment`, `like`, `follow`, `view`) + `auth`.
- Confirmed the codebase was still **100% real-estate** despite `AGENTS.md` claiming a migration (grep for hospital/doctor/patient terms returned nothing).
- Produced the Nestar → Medi-care domain mapping (now captured in `BACKEND_MIGRATION.md`).

---

## 2. Phase 1 — Safe Rename Layer (completed)

**Constraint honored:** no application source/domain logic changed; GraphQL API and MongoDB collections/DB name untouched.

### Directory renames (via `git mv`)
| From | To |
|---|---|
| `apps/nestar-api` | `apps/medicare-api` |
| `apps/nestar-batch` | `apps/medicare-batch` |

### Files modified
| File | Change |
|---|---|
| `package.json` | `name` → `medicare`; scripts (`start:dev`, `start:dev:batch`, `start:prod`, `start:prod:batch`, `test:e2e`); fixed pre-existing `nestars-api` typo |
| `nest-cli.json` | project keys + all `root`/`sourceRoot`/`tsConfigPath` paths |
| `apps/medicare-api/tsconfig.app.json` | `outDir` → `dist/apps/medicare-api` |
| `apps/medicare-batch/tsconfig.app.json` | `outDir` → `dist/apps/medicare-batch` |
| `apps/medicare-batch/src/batch.module.ts` | import paths `apps/nestar-api/...` → `apps/medicare-api/...` |
| `apps/medicare-batch/src/batch.service.ts` | 4 import paths + welcome string |
| `apps/medicare-api/src/components/auth/guards/roles.guard.ts` | import path |
| `apps/medicare-api/src/components/auth/guards/auth.guard.ts` | import path |
| `apps/medicare-api/src/app.service.ts` | welcome string |
| `apps/medicare-batch/test/app.e2e-spec.ts` | `describe` block name |

### Deliberately NOT changed
- All GraphQL types/queries/mutations/resolvers/enum names.
- All Mongoose collections (`members`, `properties`, …), fields, indexes.
- `.env` MongoDB database name `/Nestar` (data pointer — see `DECISIONS.md` ADR-004).

---

## 3. Validation Status

| Check | Command | Result |
|---|---|---|
| Typecheck — api | `tsc --noEmit -p apps/medicare-api/tsconfig.app.json` | ✅ exit 0 |
| Typecheck — batch | `tsc --noEmit -p apps/medicare-batch/tsconfig.app.json` | ✅ exit 0 |
| Build | `npm run build` (`nest build`) | ✅ webpack compiled successfully |
| Build output | — | ✅ `dist/apps/medicare-api`, `dist/apps/medicare-batch` |
| Lint (changed files) | `eslint <changed files>` | ✅ exit 0 (clean) |
| Residual `nestar` refs in source | `grep -rniI nestar` (excl. node_modules/dist/lock) | ✅ none |
| DB name preserved | `grep Nestar .env` | ✅ `/Nestar` intact |

---

## 4. Issues Found (pre-existing, NOT fixed — out of rename scope)

| Issue | Detail | Tracked in |
|---|---|---|
| Broken `lint` glob | `"{src,apps,libs,test}//*.ts"` matches no files (needs `/**/*.ts`); `format` has same bug | `NEXT_STEPS.md` |
| 56 pre-existing lint errors | unused imports + prettier tab/spacing across `comment.ts`, `like.ts`, `view.ts`, `common.enum.ts`, `Like.model.ts`, `Notice.model.ts`, `socket.gateway.ts`, api e2e spec | `NEXT_STEPS.md` |
| Stale `dist/apps/nestar*` dirs | leftover gitignored build artifacts | regenerated on clean build |

---

## 5. Not Committed

All changes are staged in the working tree (Git shows renames as `R`/`RM`). **No commit was made** — awaiting user instruction.
