# Vitality UI preview

A mobile-first, mock-only Next.js/TypeScript/Tailwind UI for the Vitality referral handoff. It is isolated from the existing testing application under `app/vitality-ui/` and is available at `/vitality-ui`.

## Scope and safety

- All people, barangays, hospital staff, appointment slots, contacts, documents, and clinical outcomes are **fictional demo data**.
- No backend, authentication, AWS service, database, migration, clinical algorithm, or API call is used.
- File attachment is explicitly mocked: the browser filename, type, and date become in-memory metadata; file contents are not read, uploaded, or stored.
- Appointment cards render only when hospital staff have confirmed an `Appointment` object.
- Attendance is a separate value (`unconfirmed`, `attended`, or `missed`) and does not silently change to “completed.”
- “Assessment completed” means an outcome was returned. It does not mean cured or that follow-up is finished.
- The optional AI area only creates a mock plain-language draft from already-approved instructions. Hospital staff must approve wording; original instructions remain visible.
- The optional Leaflet map was intentionally deferred because it is secondary to the three complete core workflows. No live location data or disease-prevalence claim is present.

## Preview

Run the existing application, then open:

```text
/vitality-ui
```

Use the role switcher at the top to preview:

- **BHW:** Patients / Follow-up, search and filters, mobile detail navigation, screening capture, mock document metadata, review-before-submit, appointment/outcome/history.
- **Hospital:** Referrals / Appointments, combined findings and original document metadata, more-information requests, confirmed appointment form, separate attendance, assessment outcome, and return-to-patient/BHW action.
- **Patient:** exactly one selected case, prominent confirmed appointment, original and staff-approved explained instructions, referral progress, outcome and next step. No staff queue or other patients.

The preview includes loading, empty, error, form-validation, and successful-save states. The “Preview error state” control is desktop-only; loading runs on initial entry, empty states are visible through filters/queues, and successful saves use an accessible status toast.

## File structure

```text
app/vitality-ui/
├── page.tsx                         # Stateful, in-memory preview route
├── fixtures.ts                     # Single fictional fixture source
├── types.ts                        # Separate domain objects and status unions
├── utils.ts                        # Asia/Manila date display and lookups
├── vitality.module.css             # Locally scoped responsive styles
├── README.md
└── components/
    ├── AppointmentCard.tsx
    ├── BhwView.tsx
    ├── CaseDetail.tsx
    ├── ExplainInstructions.tsx
    ├── HospitalView.tsx
    ├── PatientView.tsx
    ├── ReferralProgress.tsx
    ├── StateViews.tsx
    └── StatusBadge.tsx
```

Tailwind utility classes are used in the component markup for small layout concerns, while `vitality.module.css` contains the locally scoped design system and responsive component styles. The existing global stylesheet and package files are unchanged.

## Data model and statuses

Identity and workflow data remain separate:

| Object | Purpose |
|---|---|
| `Patient` | Identity and barangay link only |
| `Screening` | Measurement date, BP readings, history, referral reason |
| `PatientDoc` | Mock document metadata only |
| `Referral` | Lifecycle status and links to separate objects |
| `Appointment` | Hospital-confirmed schedule/instructions and separate attendance |
| `Outcome` | Assessment result, explanation, and next action |

Referral status values and exact labels:

| Value | UI label |
|---|---|
| `draft` | Draft |
| `submitted` | Submitted |
| `more_info_needed` | More information needed |
| `appointment_confirmed` | Appointment confirmed |
| `awaiting_outcome` | Awaiting assessment outcome |
| `further_assessment_needed` | Further assessment needed |
| `assessment_completed` | Assessment completed |

Every stable fixture uses a string ID and every date uses an ISO 8601 string. Display functions in `utils.ts` explicitly use `Asia/Manila`.

## Component contracts

Important callback payloads are exported next to the component that owns the interaction:

- `BhwView.onSubmitScreening(SubmitScreeningPayload)` — patient ID, ISO measurement date, readings, history, referral reason, and optional mock document metadata.
- `HospitalView.onRequestInfo(RequestInfoPayload)` — referral ID and reason.
- `HospitalView.onConfirmAppointment(ConfirmAppointmentPayload)` — referral ID plus facility, location, ISO time, bring/preparation instructions, and contact.
- `HospitalView.onRecordAttendance(AttendancePayload)` — referral ID plus separate attendance value.
- `HospitalView.onRecordOutcome(RecordOutcomePayload)` — referral ID, allowed outcome kind, explanation, and next action.
- `HospitalView.onReturnOutcome(referralId)` — marks a saved outcome as returned while preserving further-assessment status when applicable.
- `ExplainInstructions.onAction(ExplainInstructionsPayload)` — referral ID and `generate` or `approve`; it never changes treatment, preparation, or appointment data.

All reusable component props and callback payloads are typed and exported. Inline comments in `types.ts` document object boundaries and status semantics.

## Integrating a real data source later

1. Keep the presentation components and their typed callbacks.
2. Replace `getVitalityData()` and the in-memory state transitions in `page.tsx` with an authorized application adapter.
3. Preserve ISO dates at the boundary and continue formatting through `formatManilaDateTime`.
4. Add authenticated upload/storage separately; do not reuse the mock attachment behavior as proof of storage.
5. Keep staff approval and original instructions as explicit fields; never allow AI text to become the source of truth automatically.
