"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  BloodPressureReading,
  DocumentType,
  PatientDoc,
  Referral,
  ReferralStatus,
  Screening,
  VitalityData,
} from "../types";
import { DOCUMENT_TYPE_LABEL, REFERRAL_STATUS_LABEL } from "../types";
import {
  formatManilaDate,
  formatManilaDateTime,
  getBarangay,
  getDocuments,
  getPatient,
  getScreening,
  initials,
  isFollowUp,
  manilaInputToIso,
  nextAppointment,
  toLocalInputValue,
} from "../utils";
import styles from "../vitality.module.css";
import { CaseDetail } from "./CaseDetail";
import { EmptyState } from "./StateViews";
import { StatusBadge } from "./StatusBadge";

export interface SubmitScreeningPayload {
  patientId: string;
  measuredAt: string;
  readings: BloodPressureReading[];
  history: string;
  reasonForReferral: string;
  document?: {
    type: DocumentType;
    documentDate: string;
    fileName: string;
  };
}

export interface BhwViewProps {
  data: VitalityData;
  onSubmitScreening: (payload: SubmitScreeningPayload) => void;
}

type BhwTab = "patients" | "followup";
type FormStep = "edit" | "review";

interface ScreeningDraft {
  patientId: string;
  measuredAt: string;
  systolic1: string;
  diastolic1: string;
  systolic2: string;
  diastolic2: string;
  history: string;
  reason: string;
  includeDocument: boolean;
  documentType: DocumentType;
  documentDate: string;
  fileName: string;
}

function nowForInput(): string {
  return toLocalInputValue(new Date().toISOString());
}

function blankDraft(patientId: string): ScreeningDraft {
  return {
    patientId,
    measuredAt: nowForInput(),
    systolic1: "",
    diastolic1: "",
    systolic2: "",
    diastolic2: "",
    history: "",
    reason: "",
    includeDocument: false,
    documentType: "lab_result",
    documentDate: nowForInput().slice(0, 10),
    fileName: "",
  };
}

function validateDraft(draft: ScreeningDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const systolic1 = Number(draft.systolic1);
  const diastolic1 = Number(draft.diastolic1);
  if (!draft.patientId) errors.patientId = "Select a patient.";
  if (!draft.measuredAt) errors.measuredAt = "Enter the measurement date and time.";
  if (!Number.isFinite(systolic1) || systolic1 <= 0) errors.systolic1 = "Enter a valid systolic reading.";
  if (!Number.isFinite(diastolic1) || diastolic1 <= 0) errors.diastolic1 = "Enter a valid diastolic reading.";
  if (systolic1 && diastolic1 && systolic1 <= diastolic1) errors.systolic1 = "Systolic should be higher than diastolic. Check the recorded values.";
  if ((draft.systolic2 && !draft.diastolic2) || (!draft.systolic2 && draft.diastolic2)) errors.reading2 = "Enter both values for the second reading, or leave both blank.";
  if (!draft.history.trim()) errors.history = "Add relevant history, or write “None reported.”";
  if (!draft.reason.trim()) errors.reason = "Add a reason for referral.";
  if (draft.includeDocument && !draft.fileName) errors.fileName = "Choose a file to include.";
  if (draft.includeDocument && !draft.documentDate) errors.documentDate = "Enter the document date.";
  return errors;
}

interface RecordScreeningModalProps {
  data: VitalityData;
  initialPatientId: string;
  onClose: () => void;
  onSubmit: (payload: SubmitScreeningPayload) => void;
}

function RecordScreeningModal({ data, initialPatientId, onClose, onSubmit }: RecordScreeningModalProps) {
  const [step, setStep] = useState<FormStep>("edit");
  const [draft, setDraft] = useState<ScreeningDraft>(() => blankDraft(initialPatientId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedPatient = data.patients.find((patient) => patient.id === draft.patientId);

  function update<K extends keyof ScreeningDraft>(key: K, value: ScreeningDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep("review");
  }

  function submit() {
    const readings: BloodPressureReading[] = [
      { systolic: Number(draft.systolic1), diastolic: Number(draft.diastolic1) },
    ];
    if (draft.systolic2 && draft.diastolic2) {
      readings.push({ systolic: Number(draft.systolic2), diastolic: Number(draft.diastolic2) });
    }
    onSubmit({
      patientId: draft.patientId,
      measuredAt: manilaInputToIso(draft.measuredAt),
      readings,
      history: draft.history.trim(),
      reasonForReferral: draft.reason.trim(),
      document: draft.includeDocument
        ? {
            type: draft.documentType,
            documentDate: new Date(`${draft.documentDate}T00:00:00+08:00`).toISOString(),
            fileName: draft.fileName,
          }
        : undefined,
    });
  }

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="screening-title">
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>BHW · {step === "edit" ? "Step 1 of 2" : "Step 2 of 2"}</p>
            <h2 id="screening-title">{step === "edit" ? "Record screening" : "Review before submitting"}</h2>
          </div>
          <button className={styles.iconButton} type="button" aria-label="Close screening form" onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          {step === "edit" ? (
            <form onSubmit={review} noValidate>
              {Object.keys(errors).length ? (
                <div className={`${styles.notice} ${styles.dangerNotice}`} role="alert">
                  Check the highlighted fields before reviewing this case.
                </div>
              ) : null}
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor="screen-patient">Patient</label>
                  <select id="screen-patient" className={styles.select} value={draft.patientId} onChange={(e) => update("patientId", e.target.value)}>
                    {data.patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name}</option>)}
                  </select>
                  {errors.patientId ? <span className={styles.errorText}>{errors.patientId}</span> : null}
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor="measured-at">Measurement date and time</label>
                  <input id="measured-at" className={`${styles.input} ${errors.measuredAt ? styles.inputError : ""}`} type="datetime-local" value={draft.measuredAt} onChange={(e) => update("measuredAt", e.target.value)} />
                  <span className={styles.helpText}>Displayed in Asia/Manila time.</span>
                  {errors.measuredAt ? <span className={styles.errorText}>{errors.measuredAt}</span> : null}
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.fieldLabel}>Blood-pressure reading 1 (mmHg)</span>
                  <div className={styles.bpRow}>
                    <input aria-label="Systolic reading 1" className={`${styles.input} ${errors.systolic1 ? styles.inputError : ""}`} inputMode="numeric" type="number" min="1" placeholder="Systolic" value={draft.systolic1} onChange={(e) => update("systolic1", e.target.value)} />
                    <span aria-hidden="true">/</span>
                    <input aria-label="Diastolic reading 1" className={`${styles.input} ${errors.diastolic1 ? styles.inputError : ""}`} inputMode="numeric" type="number" min="1" placeholder="Diastolic" value={draft.diastolic1} onChange={(e) => update("diastolic1", e.target.value)} />
                  </div>
                  {errors.systolic1 || errors.diastolic1 ? <span className={styles.errorText}>{errors.systolic1 ?? errors.diastolic1}</span> : null}
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <span className={styles.fieldLabel}>Blood-pressure reading 2 (optional)</span>
                  <div className={styles.bpRow}>
                    <input aria-label="Systolic reading 2" className={styles.input} inputMode="numeric" type="number" min="1" placeholder="Systolic" value={draft.systolic2} onChange={(e) => update("systolic2", e.target.value)} />
                    <span aria-hidden="true">/</span>
                    <input aria-label="Diastolic reading 2" className={styles.input} inputMode="numeric" type="number" min="1" placeholder="Diastolic" value={draft.diastolic2} onChange={(e) => update("diastolic2", e.target.value)} />
                  </div>
                  {errors.reading2 ? <span className={styles.errorText}>{errors.reading2}</span> : null}
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor="history">Relevant history</label>
                  <textarea id="history" className={`${styles.textarea} ${errors.history ? styles.inputError : ""}`} value={draft.history} onChange={(e) => update("history", e.target.value)} placeholder="Medical history, medicines, symptoms, or None reported" />
                  {errors.history ? <span className={styles.errorText}>{errors.history}</span> : null}
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label htmlFor="reason">Reason for referral</label>
                  <textarea id="reason" className={`${styles.textarea} ${errors.reason ? styles.inputError : ""}`} value={draft.reason} onChange={(e) => update("reason", e.target.value)} placeholder="Why does this patient need hospital review?" />
                  {errors.reason ? <span className={styles.errorText}>{errors.reason}</span> : null}
                </div>
              </div>

              <p className={styles.dividerText}>Available documents</p>
              <label className={styles.checkboxRow}>
                <input type="checkbox" checked={draft.includeDocument} onChange={(e) => update("includeDocument", e.target.checked)} />
                <span><strong>Attach a document</strong><br /><span className={styles.helpText}>Demo only. The file is not sent or saved.</span></span>
              </label>
              {draft.includeDocument ? (
                <div className={`${styles.formGrid} ${styles.mockUpload}`}>
                  <div className={styles.field}>
                    <label htmlFor="doc-type">Document type</label>
                    <select id="doc-type" className={styles.select} value={draft.documentType} onChange={(e) => update("documentType", e.target.value as DocumentType)}>
                      {(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((type) => <option value={type} key={type}>{DOCUMENT_TYPE_LABEL[type]}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="doc-date">Document date</label>
                    <input id="doc-date" className={styles.input} type="date" value={draft.documentDate} onChange={(e) => update("documentDate", e.target.value)} />
                    {errors.documentDate ? <span className={styles.errorText}>{errors.documentDate}</span> : null}
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label htmlFor="mock-file">Choose file</label>
                    <input id="mock-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => update("fileName", e.target.files?.[0]?.name ?? "")} />
                    <span className={styles.helpText}>Only the file name is shown. The file is not uploaded.</span>
                    {errors.fileName ? <span className={styles.errorText}>{errors.fileName}</span> : null}
                  </div>
                </div>
              ) : null}
              <div className={styles.formActions}>
                <button className={styles.secondaryButton} type="button" onClick={onClose}>Cancel</button>
                <button className={styles.primaryButton} type="submit">Review case</button>
              </div>
            </form>
          ) : (
            <div>
              <div className={`${styles.notice} ${styles.warning}`}>
                Submitting sends a referral to the demo hospital queue. It does not create an appointment.
              </div>
              <div className={styles.reviewList}>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Patient</span><p>{selectedPatient?.name}</p></div>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Measured</span><p>{formatManilaDateTime(manilaInputToIso(draft.measuredAt))}</p></div>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Readings</span><p>{draft.systolic1}/{draft.diastolic1}{draft.systolic2 ? ` · ${draft.systolic2}/${draft.diastolic2}` : ""} mmHg</p></div>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Relevant history</span><p>{draft.history}</p></div>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Reason for referral</span><p>{draft.reason}</p></div>
                <div className={styles.reviewItem}><span className={styles.factLabel}>Document</span><p>{draft.includeDocument ? `${DOCUMENT_TYPE_LABEL[draft.documentType]} · ${draft.fileName} · mock only` : "No document attached"}</p></div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.secondaryButton} type="button" onClick={() => setStep("edit")}>Back to edit</button>
                <button className={styles.primaryButton} type="button" onClick={submit}>Submit referral</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function referralMatches(
  data: VitalityData,
  referral: Referral,
  search: string,
  barangayId: string,
  status: string,
): boolean {
  const patient = getPatient(data, referral.patientId);
  const barangay = getBarangay(data, patient.barangayId);
  const searchText = `${patient.name} ${barangay.name} ${referral.id}`.toLowerCase();
  return (
    searchText.includes(search.toLowerCase()) &&
    (barangayId === "all" || patient.barangayId === barangayId) &&
    (status === "all" || referral.status === status)
  );
}

export function BhwView({ data, onSubmitScreening }: BhwViewProps) {
  const [tab, setTab] = useState<BhwTab>("patients");
  const [search, setSearch] = useState("");
  const [barangayId, setBarangayId] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(data.referrals[0]?.id ?? "");
  const [detailOpen, setDetailOpen] = useState(false);
  const [recording, setRecording] = useState(false);

  const source = tab === "followup" ? data.referrals.filter(isFollowUp) : data.referrals;
  const filtered = useMemo(
    () => source.filter((referral) => referralMatches(data, referral, search, barangayId, status)),
    [data, source, search, barangayId, status],
  );
  const selected = data.referrals.find((referral) => referral.id === selectedId) ?? filtered[0] ?? null;

  function openReferral(referralId: string) {
    setSelectedId(referralId);
    setDetailOpen(true);
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="BHW navigation">
        <button className={`${styles.navButton} ${tab === "patients" ? styles.navButtonActive : ""}`} type="button" onClick={() => { setTab("patients"); setDetailOpen(false); }}>Patients</button>
        <button className={`${styles.navButton} ${tab === "followup" ? styles.navButtonActive : ""}`} type="button" onClick={() => { setTab("followup"); setDetailOpen(false); }}>Follow-up ({data.referrals.filter(isFollowUp).length})</button>
      </nav>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Barangay health worker</p>
            <h1 className={styles.title}>{tab === "patients" ? "Patients" : "Follow-up"}</h1>
            <p className={styles.subtitle}>{tab === "patients" ? `${data.city} · ${data.patients.length} practice patients` : "People who need information, a visit check, results, or another next step."}</p>
          </div>
          <button className={`${styles.primaryButton} ${styles.desktopOnly}`} type="button" onClick={() => setRecording(true)}>+ Record screening</button>
        </div>
        <button className={`${styles.primaryButton} ${styles.fullButton} ${styles.mobileOnly}`} type="button" onClick={() => setRecording(true)}>+ Record screening</button>

        <div className={`${styles.desktopGrid} ${detailOpen ? styles.mobileDetailOpen : ""}`}>
          <section className={`${styles.card} ${styles.listColumn} ${styles.hideOnMobileDetail}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderText}><h2>{tab === "patients" ? "Patient list" : "Awaiting action"}</h2><p>{filtered.length} case{filtered.length === 1 ? "" : "s"}</p></div>
              <span className={styles.count}>{filtered.length}</span>
            </div>
            <div className={styles.filters}>
              <div className={styles.field}>
                <label htmlFor="bhw-search">Search</label>
                <input id="bhw-search" className={styles.input} type="search" placeholder="Name or referral ID" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="bhw-barangay">Barangay</label>
                <select id="bhw-barangay" className={styles.select} value={barangayId} onChange={(e) => setBarangayId(e.target.value)}>
                  <option value="all">All barangays</option>
                  {data.barangays.map((barangay) => <option value={barangay.id} key={barangay.id}>{barangay.name}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="bhw-status">Status</label>
                <select id="bhw-status" className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  {(Object.keys(REFERRAL_STATUS_LABEL) as ReferralStatus[]).map((value) => <option value={value} key={value}>{REFERRAL_STATUS_LABEL[value]}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.list}>
              {filtered.map((referral) => {
                const patient = getPatient(data, referral.patientId);
                const barangay = getBarangay(data, patient.barangayId);
                const appointment = nextAppointment(referral);
                return (
                  <button className={`${styles.listItem} ${selected?.id === referral.id ? styles.listItemActive : ""}`} type="button" key={referral.id} onClick={() => openReferral(referral.id)}>
                    <span className={styles.avatar}>{initials(patient.name)}</span>
                    <span className={styles.listMain}>
                      <span className={styles.listName}>{patient.name}</span>
                      <span className={styles.listMeta}>{barangay.name}</span>
                      <span className={styles.listBottom}><StatusBadge status={referral.status} /></span>
                      <span className={styles.nextAppointment}>{appointment ? `Next: ${formatManilaDateTime(appointment.scheduledAt)}` : "No appointment confirmed"}</span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true">›</span>
                  </button>
                );
              })}
              {!filtered.length ? <EmptyState title="No matching cases" message="Try changing the search or filters." actionLabel="Clear filters" onAction={() => { setSearch(""); setBarangayId("all"); setStatus("all"); }} /> : null}
            </div>
          </section>

          <div className={`${styles.showOnMobileDetail} min-w-0`}>
            <button className={`${styles.secondaryButton} ${styles.backButton} ${styles.mobileOnly}`} type="button" onClick={() => setDetailOpen(false)}>← Back to {tab === "patients" ? "patients" : "follow-up"}</button>
            {selected ? (
              <CaseDetail
                patient={getPatient(data, selected.patientId)}
                barangayName={getBarangay(data, getPatient(data, selected.patientId).barangayId).name}
                screening={getScreening(data, selected.screeningId)}
                documents={getDocuments(data, selected)}
                referral={selected}
                audience="bhw"
              />
            ) : (
              <section className={`${styles.card} ${styles.detailPlaceholder}`}><EmptyState title="Select a patient" message="Choose a case to see its screening, documents, appointment, outcome, and activity." /></section>
            )}
          </div>
        </div>
      </main>
      {recording ? (
        <RecordScreeningModal
          data={data}
          initialPatientId={selected?.patientId ?? data.patients[0]?.id ?? ""}
          onClose={() => setRecording(false)}
          onSubmit={(payload) => { onSubmitScreening(payload); setRecording(false); setTab("patients"); setDetailOpen(false); }}
        />
      ) : null}
    </div>
  );
}
