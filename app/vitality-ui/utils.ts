import type {
  Appointment,
  Barangay,
  Patient,
  PatientDoc,
  Referral,
  Screening,
  VitalityData,
} from "./types";

export const MANILA_TIME_ZONE = "Asia/Manila";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: MANILA_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: MANILA_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: MANILA_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

export function formatManilaDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatManilaDateTime(value: string): string {
  return `${dateTimeFormatter.format(new Date(value))} PHT`;
}

export function formatManilaTime(value: string): string {
  return `${timeFormatter.format(new Date(value))} PHT`;
}

export function toLocalInputValue(value: string): string {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Treat a datetime-local value as Asia/Manila (UTC+08:00) and return ISO. */
export function manilaInputToIso(value: string): string {
  return new Date(`${value}:00+08:00`).toISOString();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getPatient(data: VitalityData, patientId: string): Patient {
  const patient = data.patients.find((item) => item.id === patientId);
  if (!patient) throw new Error(`Missing patient fixture: ${patientId}`);
  return patient;
}

export function getBarangay(data: VitalityData, barangayId: string): Barangay {
  const barangay = data.barangays.find((item) => item.id === barangayId);
  if (!barangay) throw new Error(`Missing barangay fixture: ${barangayId}`);
  return barangay;
}

export function getScreening(data: VitalityData, screeningId: string): Screening {
  const screening = data.screenings.find((item) => item.id === screeningId);
  if (!screening) throw new Error(`Missing screening fixture: ${screeningId}`);
  return screening;
}

export function getDocuments(data: VitalityData, referral: Referral): PatientDoc[] {
  return referral.documentIds
    .map((id) => data.documents.find((document) => document.id === id))
    .filter((document): document is PatientDoc => Boolean(document));
}

export function nextAppointment(referral: Referral): Appointment | null {
  return referral.status === "appointment_confirmed" ||
    referral.status === "awaiting_outcome" ||
    referral.status === "further_assessment_needed" ||
    referral.status === "assessment_completed"
    ? referral.appointment
    : null;
}

export function isFollowUp(referral: Referral): boolean {
  return [
    "more_info_needed",
    "appointment_confirmed",
    "awaiting_outcome",
    "further_assessment_needed",
  ].includes(referral.status);
}

export function isHospitalQueueItem(referral: Referral): boolean {
  return referral.status === "submitted" || referral.status === "more_info_needed";
}

export function isHospitalAppointment(referral: Referral): boolean {
  return Boolean(referral.appointment);
}

export function cloneData(data: VitalityData): VitalityData {
  return structuredClone(data);
}
