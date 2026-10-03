/**
 * Vitality UI — shared domain types (DEMO / FICTIONAL).
 *
 * Each real-world concept is kept as a SEPARATE object so screens can compose
 * them independently:
 *   Patient      — identity only
 *   Screening    — BHW findings
 *   PatientDoc   — attached documents (mock upload)
 *   Referral     — the referral + its lifecycle status
 *   Appointment  — only exists AFTER hospital staff confirm it
 *   Outcome      — clinical assessment result
 *   ActivityItem — audit/activity history entries
 *
 * All IDs are stable strings. All dates are ISO 8601 strings and are DISPLAYED
 * in Asia/Manila time (see utils.ts). None of this data is real.
 */

/** Referral lifecycle status. Drives the primary status label on every screen. */
export type ReferralStatus =
  | "draft" // BHW is still composing; not sent
  | "submitted" // sent to hospital review queue
  | "more_info_needed" // hospital asked for more information
  | "appointment_confirmed" // hospital accepted + confirmed an appointment
  | "awaiting_outcome" // appointment time passed / under assessment
  | "further_assessment_needed" // assessment says more work is required
  | "assessment_completed"; // outcome returned (NOT "cured" / not "finished")

/** Human-readable, plain-language labels for each status. */
export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  more_info_needed: "More information needed",
  appointment_confirmed: "Appointment confirmed",
  awaiting_outcome: "Awaiting assessment outcome",
  further_assessment_needed: "Further assessment needed",
  assessment_completed: "Assessment completed",
};

/**
 * Attendance is tracked SEPARATELY from referral status: a confirmed
 * appointment does not prove the patient attended.
 */
export type Attendance = "unconfirmed" | "attended" | "missed";

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  unconfirmed: "Attendance unconfirmed",
  attended: "Attended",
  missed: "Missed",
};

/** The three allowed clinical assessment outcomes. */
export type OutcomeKind =
  | "diagnosis_confirmed"
  | "not_confirmed" // suspected condition not confirmed
  | "further_assessment"; // further assessment needed

export const OUTCOME_LABEL: Record<OutcomeKind, string> = {
  diagnosis_confirmed: "Diagnosis confirmed",
  not_confirmed: "Suspected condition not confirmed",
  further_assessment: "Further assessment needed",
};

export type DocumentType =
  | "lab_result"
  | "prescription"
  | "referral_letter"
  | "id_document"
  | "imaging"
  | "other";

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  lab_result: "Lab result",
  prescription: "Prescription",
  referral_letter: "Referral letter",
  id_document: "ID document",
  imaging: "Imaging",
  other: "Other",
};

export interface Barangay {
  id: string;
  name: string;
  city: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M";
  barangayId: string;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
}

export interface Screening {
  id: string;
  patientId: string;
  /** ISO date the measurement was taken. */
  measuredAt: string;
  readings: BloodPressureReading[];
  /** Relevant clinical history, plain text. */
  history: string;
  /** Why the BHW is referring this patient. */
  reasonForReferral: string;
}

export interface PatientDoc {
  id: string;
  patientId: string;
  type: DocumentType;
  fileName: string;
  /** ISO date on the document itself. */
  documentDate: string;
  /** Mock only — files are NOT uploaded or stored anywhere. */
  mock: true;
}

export interface Appointment {
  id: string;
  facility: string;
  departmentOrLocation: string;
  /** ISO date-time of the appointment. */
  scheduledAt: string;
  whatToBring: string;
  /** Approved preparation instructions (hospital source of truth). */
  preparationInstructions: string;
  contact: string;
  attendance: Attendance;
}

export interface Outcome {
  id: string;
  kind: OutcomeKind;
  /** Diagnosis label when kind === "diagnosis_confirmed". */
  diagnosis?: string;
  /** Plain-language explanation returned to patient + BHW. */
  explanation: string;
  /** Next / follow-up action. */
  nextAction: string;
  /** ISO date-time the outcome was recorded. */
  recordedAt: string;
}

export type Actor = "BHW" | "Hospital" | "Patient" | "System";

export interface ActivityItem {
  id: string;
  at: string; // ISO
  actor: Actor;
  text: string;
}

/**
 * A Referral stitches the separate objects together for a single case.
 * The appointment / outcome are null until the relevant step happens.
 */
export interface Referral {
  id: string;
  patientId: string;
  screeningId: string;
  documentIds: string[];
  status: ReferralStatus;
  createdAt: string; // ISO
  /** Reason supplied when hospital requests more information. */
  moreInfoReason?: string;
  appointment: Appointment | null;
  outcome: Outcome | null;
  /**
   * Optional AI-drafted plain-language explanation of the APPROVED
   * instructions. `approved` gates whether it is shown as reviewed wording.
   */
  explainDraft?: {
    text: string;
    approved: boolean;
  };
  activity: ActivityItem[];
}

/** Hospital staff member (DEMO). */
export interface Staff {
  id: string;
  name: string;
  role: string;
  facility: string;
}

/** A fictional appointment slot staff can offer when accepting a referral. */
export interface AppointmentSlot {
  id: string;
  facility: string;
  department: string;
  startsAt: string; // ISO
}

/** Everything the preview needs, loaded from the single fixtures file. */
export interface VitalityData {
  city: string;
  barangays: Barangay[];
  patients: Patient[];
  screenings: Screening[];
  documents: PatientDoc[];
  referrals: Referral[];
  staff: Staff[];
  slots: AppointmentSlot[];
}
