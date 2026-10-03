"use client";

import { useEffect, useRef, useState } from "react";
import { getVitalityData } from "./fixtures";
import type { ActivityItem, Appointment, Outcome, PatientDoc, Referral, Screening, VitalityData } from "./types";
import styles from "./vitality.module.css";
import { BhwView, type SubmitScreeningPayload } from "./components/BhwView";
import {
  HospitalView,
  type AttendancePayload,
  type ConfirmAppointmentPayload,
  type RecordOutcomePayload,
  type RequestInfoPayload,
} from "./components/HospitalView";
import type { ExplainInstructionsPayload } from "./components/ExplainInstructions";
import { ErrorState, LoadingState, SaveToast } from "./components/StateViews";

type PreviewRole = "bhw" | "hospital";
type PreviewState = "ready" | "loading" | "error";

function activity(id: string, actor: ActivityItem["actor"], text: string): ActivityItem {
  return { id, actor, text, at: new Date().toISOString() };
}

function updateReferral(data: VitalityData, referralId: string, update: (referral: Referral) => Referral): VitalityData {
  return {
    ...data,
    referrals: data.referrals.map((referral) => referral.id === referralId ? update(referral) : referral),
  };
}

export default function VitalityPreviewPage() {
  const [data, setData] = useState<VitalityData | null>(null);
  const [role, setRole] = useState<PreviewRole>("bhw");
  const [previewState, setPreviewState] = useState<PreviewState>("loading");
  const [toast, setToast] = useState("");
  const sequence = useRef(100);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(getVitalityData());
      setPreviewState("ready");
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function nextId(prefix: string): string {
    sequence.current += 1;
    return `${prefix}-ui-${sequence.current}`;
  }

  function submitScreening(payload: SubmitScreeningPayload) {
    if (!data) return;
    const existing = data.referrals.find((referral) => referral.patientId === payload.patientId);
    const screeningId = nextId("scr");
    const createdAt = new Date().toISOString();
    const screening: Screening = {
      id: screeningId,
      patientId: payload.patientId,
      measuredAt: payload.measuredAt,
      readings: payload.readings,
      history: payload.history,
      reasonForReferral: payload.reasonForReferral,
    };
    let document: PatientDoc | undefined;
    if (payload.document) {
      document = {
        id: nextId("doc"),
        patientId: payload.patientId,
        type: payload.document.type,
        documentDate: payload.document.documentDate,
        fileName: payload.document.fileName,
        mock: true,
      };
    }
    const referral: Referral = {
      id: existing?.id ?? nextId("ref"),
      patientId: payload.patientId,
      screeningId,
      documentIds: document ? [document.id] : [],
      status: "submitted",
      createdAt,
      appointment: null,
      outcome: null,
      activity: [activity(nextId("act"), "BHW", "Screening reviewed and submitted to the demo hospital queue. No appointment has been created.")],
    };
    setData({
      ...data,
      screenings: [screening, ...data.screenings],
      documents: document ? [document, ...data.documents] : data.documents,
      referrals: existing
        ? data.referrals.map((item) => item.id === existing.id ? referral : item)
        : [referral, ...data.referrals],
    });
    setToast("Referral submitted to the demo hospital queue. No appointment is confirmed yet.");
  }

  function requestInfo(payload: RequestInfoPayload) {
    if (!data) return;
    setData(updateReferral(data, payload.referralId, (referral) => ({
      ...referral,
      status: "more_info_needed",
      moreInfoReason: payload.reason,
      activity: [...referral.activity, activity(nextId("act"), "Hospital", `Requested more information: ${payload.reason}`)],
    })));
    setToast("Request sent to the BHW in this demo.");
  }

  function confirmAppointment(payload: ConfirmAppointmentPayload) {
    if (!data) return;
    const appointment: Appointment = {
      id: nextId("appt"),
      facility: payload.facility,
      departmentOrLocation: payload.departmentOrLocation,
      scheduledAt: payload.scheduledAt,
      whatToBring: payload.whatToBring,
      preparationInstructions: payload.preparationInstructions,
      contact: payload.contact,
      attendance: "unconfirmed",
    };
    setData(updateReferral(data, payload.referralId, (referral) => ({
      ...referral,
      status: "appointment_confirmed",
      moreInfoReason: undefined,
      appointment,
      activity: [...referral.activity, activity(nextId("act"), "Hospital", "Referral accepted and demo appointment confirmed by hospital staff.")],
    })));
    setToast("Demo appointment confirmed. Original instructions remain visible.");
  }

  function recordAttendance(payload: AttendancePayload) {
    if (!data) return;
    setData(updateReferral(data, payload.referralId, (referral) => {
      if (!referral.appointment) return referral;
      return {
        ...referral,
        status: payload.attendance === "attended" ? "awaiting_outcome" : referral.status,
        appointment: { ...referral.appointment, attendance: payload.attendance },
        activity: [...referral.activity, activity(nextId("act"), "Hospital", `Attendance recorded separately: ${payload.attendance}.`)],
      };
    }));
    setToast("Attendance saved separately from referral status.");
  }

  function recordOutcome(payload: RecordOutcomePayload) {
    if (!data) return;
    const outcome: Outcome = {
      id: nextId("out"),
      kind: payload.kind,
      diagnosis: payload.diagnosis,
      explanation: payload.explanation,
      nextAction: payload.nextAction,
      recordedAt: new Date().toISOString(),
    };
    setData(updateReferral(data, payload.referralId, (referral) => ({
      ...referral,
      status: "awaiting_outcome",
      outcome,
      activity: [...referral.activity, activity(nextId("act"), "Hospital", "Demo clinical outcome recorded; not yet returned to the patient and BHW.")],
    })));
    setToast("Demo outcome saved. Return it when the explanation and next action are ready.");
  }

  function returnOutcome(referralId: string) {
    if (!data) return;
    setData(updateReferral(data, referralId, (referral) => {
      if (!referral.outcome) return referral;
      return {
        ...referral,
        status: referral.outcome.kind === "further_assessment" ? "further_assessment_needed" : "assessment_completed",
        activity: [...referral.activity, activity(nextId("act"), "Hospital", "Assessment outcome and next action returned to the patient and BHW.")],
      };
    }));
    setToast("Outcome returned to the patient and BHW. Follow-up may still be needed.");
  }

  function explainInstructions(payload: ExplainInstructionsPayload) {
    if (!data) return;
    setData(updateReferral(data, payload.referralId, (referral) => {
      if (!referral.appointment) return referral;
      if (payload.action === "approve" && referral.explainDraft) {
        return {
          ...referral,
          explainDraft: { ...referral.explainDraft, approved: true },
          activity: [...referral.activity, activity(nextId("act"), "Hospital", "Demo hospital staff approved the plain-language wording against the original instructions.")],
        };
      }
      return {
        ...referral,
        explainDraft: {
          text: `Draft explanation: ${referral.appointment.preparationInstructions} Bring: ${referral.appointment.whatToBring}`,
          approved: false,
        },
        activity: [...referral.activity, activity(nextId("act"), "System", "A draft explanation was created and still needs staff approval.")],
      };
    }));
    setToast(payload.action === "approve" ? "The explanation was checked and approved." : "Draft explanation created. Hospital staff must check it.");
  }

  function retry() {
    setPreviewState("loading");
    window.setTimeout(() => { setData(getVitalityData()); setPreviewState("ready"); }, 450);
  }

  return (
    <div className={`${styles.vitality} min-h-screen`}>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <div className={`${styles.topBarInner} flex items-center justify-between`}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true">V</span>
              <div><span className={styles.brandName}>vitality</span><span className={styles.brandCaption}> · patient referrals</span></div>
            </div>
            <div className={styles.roleSwitcher} aria-label="Choose your work area">
              {(["bhw", "hospital"] as PreviewRole[]).map((item) => (
                <button
                  className={`${styles.roleButton} ${role === item ? styles.roleButtonActive : ""}`}
                  type="button"
                  key={item}
                  aria-pressed={role === item}
                  onClick={() => setRole(item)}
                >
                  {item === "bhw" ? "BHW" : "Hospital team"}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div className={styles.demoStrip}>
          <div className={styles.demoStripInner}>
            <span className={styles.demoPill}>DEMO</span>
            <span>Practice records only. All people, hospital staff, schedules, and results are made up.</span>
          </div>
        </div>

        {previewState === "loading" ? <LoadingState /> : null}
        {previewState === "error" ? <ErrorState message="This is a simulated loading error. No data was changed." onRetry={retry} /> : null}
        {previewState === "ready" && data ? (
          role === "bhw" ? (
            <BhwView data={data} onSubmitScreening={submitScreening} />
          ) : (
            <HospitalView
              data={data}
              onRequestInfo={requestInfo}
              onConfirmAppointment={confirmAppointment}
              onRecordAttendance={recordAttendance}
              onRecordOutcome={recordOutcome}
              onReturnOutcome={returnOutcome}
              onExplainAction={explainInstructions}
            />
          )
        ) : null}

        {previewState === "ready" ? (
          <button
            className={`${styles.ghostButton} ${styles.desktopOnly} fixed right-4 bottom-3 z-20 text-[11px]`}
            type="button"
            onClick={() => setPreviewState("error")}
          >
            Preview error state
          </button>
        ) : null}
        {toast ? <SaveToast message={toast} onDismiss={() => setToast("")} /> : null}
      </div>
    </div>
  );
}
