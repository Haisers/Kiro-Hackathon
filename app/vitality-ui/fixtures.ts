/**
 * Vitality UI — SINGLE mock fixtures file (ALL DATA IS FICTIONAL / DEMO).
 *
 * One city, two barangays, five patients. Hospital staff, appointment slots and
 * clinical outcomes are illustrative demo data and must be labelled as such in
 * the UI. Nothing here is real; no files are uploaded or stored.
 *
 * Keeping every fixture in one file (per the integration brief) makes it trivial
 * to swap in a real data source later: replace `getVitalityData()`.
 */
import type {
  Appointment,
  AppointmentSlot,
  Barangay,
  Outcome,
  Patient,
  PatientDoc,
  Referral,
  Screening,
  Staff,
  VitalityData,
} from "./types";

const CITY = "Demo City";

const BARANGAYS: Barangay[] = [
  { id: "brgy-mabini", name: "Barangay Mabini", city: CITY },
  { id: "brgy-rizal", name: "Barangay Rizal", city: CITY },
];

const PATIENTS: Patient[] = [
  { id: "pt-001", name: "Ana Dela Cruz", age: 58, sex: "F", barangayId: "brgy-mabini" },
  { id: "pt-002", name: "Benigno Ramos", age: 64, sex: "M", barangayId: "brgy-mabini" },
  { id: "pt-003", name: "Carmen Villanueva", age: 47, sex: "F", barangayId: "brgy-rizal" },
  { id: "pt-004", name: "Dario Mendoza", age: 71, sex: "M", barangayId: "brgy-rizal" },
  { id: "pt-005", name: "Elena Santos", age: 52, sex: "F", barangayId: "brgy-mabini" },
];

const SCREENINGS: Screening[] = [
  {
    id: "scr-001",
    patientId: "pt-001",
    measuredAt: "2026-09-28T09:15:00+08:00",
    readings: [
      { systolic: 168, diastolic: 102 },
      { systolic: 172, diastolic: 104 },
    ],
    history: "Known hypertension, irregular medication for 3 months. Reports occasional headaches.",
    reasonForReferral: "Persistently high blood pressure on repeat screening; needs hospital evaluation.",
  },
  {
    id: "scr-002",
    patientId: "pt-002",
    measuredAt: "2026-09-29T10:40:00+08:00",
    readings: [{ systolic: 150, diastolic: 94 }],
    history: "Type 2 diabetes, on metformin. Complains of blurred vision this week.",
    reasonForReferral: "Elevated BP with new vision complaint; requests specialist review.",
  },
  {
    id: "scr-003",
    patientId: "pt-003",
    measuredAt: "2026-09-30T08:05:00+08:00",
    readings: [{ systolic: 138, diastolic: 88 }],
    history: "No prior chronic illness recorded. Family history of stroke.",
    reasonForReferral: "Borderline readings with family risk factors; precautionary referral.",
  },
  {
    id: "scr-004",
    patientId: "pt-004",
    measuredAt: "2026-10-01T14:20:00+08:00",
    readings: [
      { systolic: 182, diastolic: 110 },
      { systolic: 179, diastolic: 108 },
    ],
    history: "Previous mild stroke 2 years ago. On maintenance medication.",
    reasonForReferral: "Severe readings in a high-risk patient; urgent hospital assessment requested.",
  },
  {
    id: "scr-005",
    patientId: "pt-005",
    measuredAt: "2026-10-02T11:00:00+08:00",
    readings: [{ systolic: 144, diastolic: 90 }],
    history: "First-time screening. Reports stressful work schedule, poor sleep.",
    reasonForReferral: "Newly detected elevated BP; refer for baseline evaluation.",
  },
];

const DOCUMENTS: PatientDoc[] = [
  {
    id: "doc-001",
    patientId: "pt-001",
    type: "lab_result",
    fileName: "ana-lipid-panel.pdf",
    documentDate: "2026-09-10T00:00:00+08:00",
    mock: true,
  },
  {
    id: "doc-002",
    patientId: "pt-001",
    type: "prescription",
    fileName: "ana-maintenance-rx.jpg",
    documentDate: "2026-07-02T00:00:00+08:00",
    mock: true,
  },
  {
    id: "doc-003",
    patientId: "pt-004",
    type: "referral_letter",
    fileName: "dario-prior-discharge.pdf",
    documentDate: "2024-05-18T00:00:00+08:00",
    mock: true,
  },
  {
    id: "doc-004",
    patientId: "pt-002",
    type: "lab_result",
    fileName: "benigno-hba1c.pdf",
    documentDate: "2026-09-01T00:00:00+08:00",
    mock: true,
  },
];

/** DEMO hospital staff — illustrative only. */
const STAFF: Staff[] = [
  { id: "stf-001", name: "Dr. Reyes (demo)", role: "Internal Medicine", facility: "Demo Provincial Hospital" },
  { id: "stf-002", name: "Nurse Lim (demo)", role: "Referral Coordinator", facility: "Demo Provincial Hospital" },
];

/** DEMO appointment slots — illustrative only, not a real schedule. */
const SLOTS: AppointmentSlot[] = [
  { id: "slot-001", facility: "Demo Provincial Hospital", department: "Cardiology Clinic, 2nd Floor", startsAt: "2026-10-07T09:00:00+08:00" },
  { id: "slot-002", facility: "Demo Provincial Hospital", department: "Internal Medicine OPD, Room 4", startsAt: "2026-10-08T10:30:00+08:00" },
  { id: "slot-003", facility: "Demo Provincial Hospital", department: "Cardiology Clinic, 2nd Floor", startsAt: "2026-10-09T13:00:00+08:00" },
];

const APPT_PT004: Appointment = {
  id: "appt-004",
  facility: "Demo Provincial Hospital",
  departmentOrLocation: "Cardiology Clinic, 2nd Floor",
  scheduledAt: "2026-10-06T09:30:00+08:00",
  whatToBring: "Valid ID, previous medication list, and the referral slip.",
  preparationInstructions: "Continue current medication. Avoid caffeine on the morning of the visit. Bring a list of all medicines taken.",
  contact: "Demo Provincial Hospital referral desk · (0XX) 000-0000 (demo number).",
  attendance: "unconfirmed",
};

const OUTCOME_PT001: Outcome = {
  id: "out-001",
  kind: "diagnosis_confirmed",
  diagnosis: "Stage 2 hypertension (demo).",
  explanation:
    "Blood pressure was high during the hospital assessment. The doctor confirmed hypertension and adjusted the maintenance plan. This result does not mean the condition is cured.",
  nextAction: "Return to the barangay health worker for monthly BP monitoring. Review at the hospital in 8 weeks.",
  recordedAt: "2026-10-02T15:30:00+08:00",
};

const REFERRALS: Referral[] = [
  // pt-001 — completed outcome returned
  {
    id: "ref-001",
    patientId: "pt-001",
    screeningId: "scr-001",
    documentIds: ["doc-001", "doc-002"],
    status: "assessment_completed",
    createdAt: "2026-09-28T09:30:00+08:00",
    appointment: {
      id: "appt-001",
      facility: "Demo Provincial Hospital",
      departmentOrLocation: "Internal Medicine OPD, Room 4",
      scheduledAt: "2026-10-01T10:00:00+08:00",
      whatToBring: "Valid ID and previous lab results.",
      preparationInstructions: "Fast for 8 hours before the visit for repeat blood tests. Continue regular medication with a sip of water.",
      contact: "Demo Provincial Hospital referral desk · (0XX) 000-0000 (demo number).",
      attendance: "attended",
    },
    outcome: OUTCOME_PT001,
    explainDraft: {
      text:
        "In simple terms: fast for 8 hours means no food, only water, before your blood test. Keep taking your usual medicine with a small sip of water. Bring your ID and old lab papers.",
      approved: true,
    },
    activity: [
      { id: "a1", at: "2026-09-28T09:30:00+08:00", actor: "BHW", text: "Screening submitted for hospital review." },
      { id: "a2", at: "2026-09-29T08:10:00+08:00", actor: "Hospital", text: "Referral accepted; appointment confirmed." },
      { id: "a3", at: "2026-10-01T10:05:00+08:00", actor: "Hospital", text: "Attendance recorded: attended." },
      { id: "a4", at: "2026-10-02T15:30:00+08:00", actor: "Hospital", text: "Assessment outcome returned to patient and BHW." },
    ],
  },
  // pt-002 — hospital asked for more info
  {
    id: "ref-002",
    patientId: "pt-002",
    screeningId: "scr-002",
    documentIds: ["doc-004"],
    status: "more_info_needed",
    createdAt: "2026-09-29T11:00:00+08:00",
    moreInfoReason: "Please attach the most recent HbA1c result and confirm current eye symptoms before we schedule.",
    appointment: null,
    outcome: null,
    activity: [
      { id: "b1", at: "2026-09-29T11:00:00+08:00", actor: "BHW", text: "Screening submitted for hospital review." },
      { id: "b2", at: "2026-09-30T09:20:00+08:00", actor: "Hospital", text: "Requested more information before scheduling." },
    ],
  },
  // pt-003 — submitted, waiting in queue
  {
    id: "ref-003",
    patientId: "pt-003",
    screeningId: "scr-003",
    documentIds: [],
    status: "submitted",
    createdAt: "2026-09-30T08:20:00+08:00",
    appointment: null,
    outcome: null,
    activity: [{ id: "c1", at: "2026-09-30T08:20:00+08:00", actor: "BHW", text: "Screening submitted for hospital review." }],
  },
  // pt-004 — appointment confirmed, awaiting attendance/outcome
  {
    id: "ref-004",
    patientId: "pt-004",
    screeningId: "scr-004",
    documentIds: ["doc-003"],
    status: "appointment_confirmed",
    createdAt: "2026-10-01T14:30:00+08:00",
    appointment: APPT_PT004,
    outcome: null,
    explainDraft: {
      text:
        "Draft explanation: keep taking your medicine as usual. Do not drink coffee on the morning of your visit. Bring your ID, your medicine list, and the referral paper.",
      approved: false,
    },
    activity: [
      { id: "d1", at: "2026-10-01T14:30:00+08:00", actor: "BHW", text: "Screening submitted for hospital review." },
      { id: "d2", at: "2026-10-02T09:00:00+08:00", actor: "Hospital", text: "Referral accepted; appointment confirmed." },
    ],
  },
  // pt-005 — draft, not yet submitted
  {
    id: "ref-005",
    patientId: "pt-005",
    screeningId: "scr-005",
    documentIds: [],
    status: "draft",
    createdAt: "2026-10-02T11:10:00+08:00",
    appointment: null,
    outcome: null,
    activity: [{ id: "e1", at: "2026-10-02T11:10:00+08:00", actor: "BHW", text: "Draft screening started." }],
  },
];

/**
 * Returns a deep-cloned snapshot so the in-memory demo can mutate state without
 * corrupting the original fixtures (and so a reset is trivial).
 */
export function getVitalityData(): VitalityData {
  const data: VitalityData = {
    city: CITY,
    barangays: BARANGAYS,
    patients: PATIENTS,
    screenings: SCREENINGS,
    documents: DOCUMENTS,
    referrals: REFERRALS,
    staff: STAFF,
    slots: SLOTS,
  };
  return structuredClone(data);
}
