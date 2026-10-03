"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Attendance, OutcomeKind, Referral, VitalityData } from "../types";
import { ATTENDANCE_LABEL, OUTCOME_LABEL } from "../types";
import {
  formatManilaDateTime,
  getBarangay,
  getDocuments,
  getPatient,
  getScreening,
  initials,
  isHospitalAppointment,
  isHospitalQueueItem,
  manilaInputToIso,
  toLocalInputValue,
} from "../utils";
import styles from "../vitality.module.css";
import { CaseDetail } from "./CaseDetail";
import type { ExplainInstructionsPayload } from "./ExplainInstructions";
import { EmptyState } from "./StateViews";
import { AttendanceBadge, StatusBadge } from "./StatusBadge";

export interface RequestInfoPayload { referralId: string; reason: string; }
export interface ConfirmAppointmentPayload {
  referralId: string;
  facility: string;
  departmentOrLocation: string;
  scheduledAt: string;
  whatToBring: string;
  preparationInstructions: string;
  contact: string;
}
export interface AttendancePayload { referralId: string; attendance: Attendance; }
export interface RecordOutcomePayload {
  referralId: string;
  kind: OutcomeKind;
  diagnosis?: string;
  explanation: string;
  nextAction: string;
}

export interface HospitalViewProps {
  data: VitalityData;
  onRequestInfo: (payload: RequestInfoPayload) => void;
  onConfirmAppointment: (payload: ConfirmAppointmentPayload) => void;
  onRecordAttendance: (payload: AttendancePayload) => void;
  onRecordOutcome: (payload: RecordOutcomePayload) => void;
  onReturnOutcome: (referralId: string) => void;
  onExplainAction: (payload: ExplainInstructionsPayload) => void;
}

type HospitalTab = "referrals" | "appointments";
type ReviewAction = "request" | "accept" | "outcome" | null;

interface HospitalActionsProps extends Omit<HospitalViewProps, "data" | "onExplainAction"> {
  data: VitalityData;
  referral: Referral;
}

function HospitalActions({
  data,
  referral,
  onRequestInfo,
  onConfirmAppointment,
  onRecordAttendance,
  onRecordOutcome,
  onReturnOutcome,
}: HospitalActionsProps) {
  const [action, setAction] = useState<ReviewAction>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const firstSlot = data.slots[0];
  const [slotId, setSlotId] = useState(firstSlot?.id ?? "");
  const selectedSlot = data.slots.find((slot) => slot.id === slotId) ?? firstSlot;
  const [appointment, setAppointment] = useState(() => ({
    facility: selectedSlot?.facility ?? "Demo Provincial Hospital",
    department: selectedSlot?.department ?? "Internal Medicine OPD",
    scheduledAt: selectedSlot ? toLocalInputValue(selectedSlot.startsAt) : "",
    whatToBring: "Valid ID, referral slip, medication list, and available original documents.",
    preparation: "Continue current medication unless hospital staff give different approved instructions. Bring a list of all medicines.",
    contact: "Demo Provincial Hospital referral desk · (0XX) 000-0000 (demo number).",
  }));
  const [outcome, setOutcome] = useState({
    kind: "further_assessment" as OutcomeKind,
    diagnosis: "",
    explanation: "",
    nextAction: "",
  });

  function chooseSlot(nextId: string) {
    setSlotId(nextId);
    const slot = data.slots.find((item) => item.id === nextId);
    if (slot) setAppointment((current) => ({ ...current, facility: slot.facility, department: slot.department, scheduledAt: toLocalInputValue(slot.startsAt) }));
  }

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) { setError("Enter a clear reason for the BHW."); return; }
    onRequestInfo({ referralId: referral.id, reason: reason.trim() });
    setAction(null); setReason(""); setError("");
  }

  function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment.facility.trim() || !appointment.department.trim() || !appointment.scheduledAt || !appointment.whatToBring.trim() || !appointment.preparation.trim() || !appointment.contact.trim()) {
      setError("Complete every appointment field before confirming."); return;
    }
    onConfirmAppointment({
      referralId: referral.id,
      facility: appointment.facility.trim(),
      departmentOrLocation: appointment.department.trim(),
      scheduledAt: manilaInputToIso(appointment.scheduledAt),
      whatToBring: appointment.whatToBring.trim(),
      preparationInstructions: appointment.preparation.trim(),
      contact: appointment.contact.trim(),
    });
    setAction(null); setError("");
  }

  function submitOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (outcome.kind === "diagnosis_confirmed" && !outcome.diagnosis.trim()) { setError("Enter the confirmed diagnosis label."); return; }
    if (!outcome.explanation.trim() || !outcome.nextAction.trim()) { setError("Enter both a patient-facing explanation and next action."); return; }
    onRecordOutcome({
      referralId: referral.id,
      kind: outcome.kind,
      diagnosis: outcome.kind === "diagnosis_confirmed" ? outcome.diagnosis.trim() : undefined,
      explanation: outcome.explanation.trim(),
      nextAction: outcome.nextAction.trim(),
    });
    setAction(null); setError("");
  }

  const canReview = referral.status === "submitted" || referral.status === "more_info_needed";
  const canRecordOutcome = Boolean(referral.appointment) && referral.appointment?.attendance === "attended";
  const outcomeReturned = referral.status === "assessment_completed" || referral.status === "further_assessment_needed";

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <h2>Hospital actions</h2>
          <p>Performed as demo hospital staff; no real appointment or clinical action occurs.</p>
        </div>
      </div>
      <div className={styles.cardBody}>
        {canReview ? (
          <div className={styles.buttonRow}>
            <button className={styles.secondaryButton} type="button" onClick={() => { setAction("request"); setError(""); }}>Request more information</button>
            <button className={styles.primaryButton} type="button" onClick={() => { setAction("accept"); setError(""); }}>Accept & confirm appointment</button>
          </div>
        ) : null}

        {referral.appointment ? (
          <div>
            <p className={styles.dividerText}>Attendance — separate from referral status</p>
            <div className={styles.buttonRow}>
              {(["unconfirmed", "attended", "missed"] as Attendance[]).map((attendance) => (
                <button
                  className={referral.appointment?.attendance === attendance ? styles.primaryButton : styles.secondaryButton}
                  type="button"
                  key={attendance}
                  onClick={() => onRecordAttendance({ referralId: referral.id, attendance })}
                >
                  {ATTENDANCE_LABEL[attendance]}
                </button>
              ))}
            </div>
            <p className={styles.helpText}>Attendance does not automatically complete the referral.</p>
          </div>
        ) : null}

        {canRecordOutcome && !outcomeReturned ? (
          <div>
            <p className={styles.dividerText}>Assessment</p>
            {!referral.outcome ? (
              <button className={styles.primaryButton} type="button" onClick={() => { setAction("outcome"); setError(""); }}>Record assessment outcome</button>
            ) : (
              <div className={styles.notice}>
                <strong>Outcome saved as demo data.</strong> Check the explanation and next action, then return it to the patient and BHW.
              </div>
            )}
            {referral.outcome ? (
              <button className={`${styles.primaryButton} ${styles.fullButton}`} type="button" onClick={() => onReturnOutcome(referral.id)}>Return outcome to patient & BHW</button>
            ) : null}
          </div>
        ) : null}

        {referral.appointment && referral.appointment.attendance !== "attended" && !outcomeReturned ? (
          <p className={`${styles.notice} ${styles.warning}`}>Record attendance as attended before entering an assessment outcome.</p>
        ) : null}
        {outcomeReturned ? <p className={`${styles.notice} ${styles.successNotice}`}>Outcome returned. Ongoing follow-up may still be required.</p> : null}

        {action === "request" ? (
          <form className={styles.aiDraft} onSubmit={submitRequest} noValidate>
            <div className={styles.field}>
              <label htmlFor="info-reason">Reason for more information</label>
              <textarea id="info-reason" className={`${styles.textarea} ${error ? styles.inputError : ""}`} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} placeholder="Tell the BHW exactly what is missing" />
              {error ? <span className={styles.errorText}>{error}</span> : null}
            </div>
            <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => setAction(null)}>Cancel</button><button className={styles.primaryButton} type="submit">Send request</button></div>
          </form>
        ) : null}

        {action === "accept" ? (
          <form className={styles.aiDraft} onSubmit={submitAppointment} noValidate>
            <div className={`${styles.notice} ${styles.warning}`}>These are practice appointment times. Choosing one only updates this demo.</div>
            {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="demo-slot">Demo appointment slot</label>
                <select id="demo-slot" className={styles.select} value={slotId} onChange={(e) => chooseSlot(e.target.value)}>
                  {data.slots.map((slot) => <option value={slot.id} key={slot.id}>{formatManilaDateTime(slot.startsAt)} · {slot.department} (demo)</option>)}
                </select>
              </div>
              <div className={styles.field}><label htmlFor="facility">Facility</label><input id="facility" className={styles.input} value={appointment.facility} onChange={(e) => setAppointment((current) => ({ ...current, facility: e.target.value }))} /></div>
              <div className={styles.field}><label htmlFor="department">Department / location</label><input id="department" className={styles.input} value={appointment.department} onChange={(e) => setAppointment((current) => ({ ...current, department: e.target.value }))} /></div>
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="appointment-time">Date and time</label><input id="appointment-time" className={styles.input} type="datetime-local" value={appointment.scheduledAt} onChange={(e) => setAppointment((current) => ({ ...current, scheduledAt: e.target.value }))} /></div>
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="bring">What to bring</label><textarea id="bring" className={styles.textarea} value={appointment.whatToBring} onChange={(e) => setAppointment((current) => ({ ...current, whatToBring: e.target.value }))} /></div>
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="preparation">Approved preparation instructions</label><textarea id="preparation" className={styles.textarea} value={appointment.preparation} onChange={(e) => setAppointment((current) => ({ ...current, preparation: e.target.value }))} /><span className={styles.helpText}>AI cannot invent this content. Hospital staff enter and approve it.</span></div>
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="contact">Contact</label><input id="contact" className={styles.input} value={appointment.contact} onChange={(e) => setAppointment((current) => ({ ...current, contact: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => setAction(null)}>Cancel</button><button className={styles.primaryButton} type="submit">Confirm demo appointment</button></div>
          </form>
        ) : null}

        {action === "outcome" ? (
          <form className={styles.aiDraft} onSubmit={submitOutcome} noValidate>
            <div className={`${styles.notice} ${styles.warning}`}>Clinical outcome is demo data and is not medical advice.</div>
            {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="outcome-kind">Assessment outcome</label>
                <select id="outcome-kind" className={styles.select} value={outcome.kind} onChange={(e) => setOutcome((current) => ({ ...current, kind: e.target.value as OutcomeKind }))}>
                  {(Object.keys(OUTCOME_LABEL) as OutcomeKind[]).map((kind) => <option value={kind} key={kind}>{OUTCOME_LABEL[kind]}</option>)}
                </select>
              </div>
              {outcome.kind === "diagnosis_confirmed" ? <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="diagnosis">Confirmed diagnosis label</label><input id="diagnosis" className={styles.input} value={outcome.diagnosis} onChange={(e) => setOutcome((current) => ({ ...current, diagnosis: e.target.value }))} /></div> : null}
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="explanation">Patient-facing explanation</label><textarea id="explanation" className={styles.textarea} value={outcome.explanation} onChange={(e) => setOutcome((current) => ({ ...current, explanation: e.target.value }))} /></div>
              <div className={`${styles.field} ${styles.fieldWide}`}><label htmlFor="next-action">Next / follow-up action</label><textarea id="next-action" className={styles.textarea} value={outcome.nextAction} onChange={(e) => setOutcome((current) => ({ ...current, nextAction: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}><button className={styles.secondaryButton} type="button" onClick={() => setAction(null)}>Cancel</button><button className={styles.primaryButton} type="submit">Save demo outcome</button></div>
          </form>
        ) : null}
      </div>
    </section>
  );
}

export function HospitalView(props: HospitalViewProps) {
  const { data } = props;
  const [tab, setTab] = useState<HospitalTab>("referrals");
  const [selectedId, setSelectedId] = useState(data.referrals.find(isHospitalQueueItem)?.id ?? data.referrals[0]?.id ?? "");
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");

  const source = tab === "referrals" ? data.referrals.filter(isHospitalQueueItem) : data.referrals.filter(isHospitalAppointment);
  const filtered = useMemo(() => source.filter((referral) => {
    const patient = getPatient(data, referral.patientId);
    return `${patient.name} ${referral.id}`.toLowerCase().includes(search.toLowerCase());
  }), [data, source, search]);
  const selected = data.referrals.find((referral) => referral.id === selectedId) ?? filtered[0] ?? null;

  function changeTab(next: HospitalTab) {
    setTab(next); setDetailOpen(false);
    const first = (next === "referrals" ? data.referrals.filter(isHospitalQueueItem) : data.referrals.filter(isHospitalAppointment))[0];
    if (first) setSelectedId(first.id);
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="Hospital navigation">
        <button className={`${styles.navButton} ${tab === "referrals" ? styles.navButtonActive : ""}`} type="button" onClick={() => changeTab("referrals")}>Referrals ({data.referrals.filter(isHospitalQueueItem).length})</button>
        <button className={`${styles.navButton} ${tab === "appointments" ? styles.navButtonActive : ""}`} type="button" onClick={() => changeTab("appointments")}>Appointments ({data.referrals.filter(isHospitalAppointment).length})</button>
      </nav>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Hospital team · practice staff</p>
            <h1 className={styles.title}>{tab === "referrals" ? "Incoming referrals" : "Appointments"}</h1>
            <p className={styles.subtitle}>{data.staff.map((member) => member.name).join(" · ")} · fictional staff at {data.staff[0]?.facility}</p>
          </div>
        </div>

        <div className={`${styles.desktopGrid} ${detailOpen ? styles.mobileDetailOpen : ""}`}>
          <section className={`${styles.card} ${styles.listColumn} ${styles.hideOnMobileDetail}`}>
            <div className={styles.cardHeader}><div className={styles.cardHeaderText}><h2>{tab === "referrals" ? "Review queue" : "Confirmed schedule"}</h2><p>{filtered.length} demo case{filtered.length === 1 ? "" : "s"}</p></div><span className={styles.count}>{filtered.length}</span></div>
            <div className={`${styles.filters} ${styles.filtersSingle}`}>
              <div className={styles.field}><label htmlFor="hospital-search">Search</label><input id="hospital-search" className={styles.input} type="search" placeholder="Patient or referral ID" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
            <div className={styles.list}>
              {filtered.map((referral) => {
                const patient = getPatient(data, referral.patientId);
                const barangay = getBarangay(data, patient.barangayId);
                return (
                  <button className={`${styles.listItem} ${selected?.id === referral.id ? styles.listItemActive : ""}`} type="button" key={referral.id} onClick={() => { setSelectedId(referral.id); setDetailOpen(true); }}>
                    <span className={styles.avatar}>{initials(patient.name)}</span>
                    <span className={styles.listMain}>
                      <span className={styles.listName}>{patient.name}</span>
                      <span className={styles.listMeta}>{barangay.name} · {referral.id}</span>
                      <span className={styles.listBottom}><StatusBadge status={referral.status} />{referral.appointment ? <AttendanceBadge attendance={referral.appointment.attendance} /> : null}</span>
                      {referral.appointment ? <span className={styles.nextAppointment}>{formatManilaDateTime(referral.appointment.scheduledAt)} · demo slot</span> : null}
                      {referral.moreInfoReason ? <span className={styles.queueReason}>{referral.moreInfoReason}</span> : null}
                    </span>
                    <span className={styles.chevron} aria-hidden="true">›</span>
                  </button>
                );
              })}
              {!filtered.length ? <EmptyState title={search ? "No matching cases" : tab === "referrals" ? "Referral queue is clear" : "No confirmed appointments"} message={search ? "Try a different name or referral ID." : "Demo cases will appear here when they reach this stage."} actionLabel={search ? "Clear search" : undefined} onAction={search ? () => setSearch("") : undefined} /> : null}
            </div>
          </section>

          <div className={`${styles.showOnMobileDetail} min-w-0`}>
            <button className={`${styles.secondaryButton} ${styles.backButton} ${styles.mobileOnly}`} type="button" onClick={() => setDetailOpen(false)}>← Back to {tab}</button>
            {selected ? (
              <CaseDetail
                patient={getPatient(data, selected.patientId)}
                barangayName={getBarangay(data, getPatient(data, selected.patientId).barangayId).name}
                screening={getScreening(data, selected.screeningId)}
                documents={getDocuments(data, selected)}
                referral={selected}
                audience="hospital"
                onExplainAction={props.onExplainAction}
                actions={<HospitalActions {...props} referral={selected} />}
              />
            ) : <section className={`${styles.card} ${styles.detailPlaceholder}`}><EmptyState title="Select a case" message="Choose a referral to see the screening and attached file names together." /></section>}
          </div>
        </div>
      </main>
    </div>
  );
}
