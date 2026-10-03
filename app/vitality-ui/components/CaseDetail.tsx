import type { ReactNode } from "react";
import type { Patient, PatientDoc, Referral, Screening } from "../types";
import { DOCUMENT_TYPE_LABEL, OUTCOME_LABEL } from "../types";
import { formatManilaDate, formatManilaDateTime } from "../utils";
import styles from "../vitality.module.css";
import { AppointmentCard } from "./AppointmentCard";
import { ExplainInstructions, type ExplainInstructionsPayload } from "./ExplainInstructions";
import { StatusBadge } from "./StatusBadge";

export interface CaseDetailProps {
  patient: Patient;
  barangayName: string;
  screening: Screening;
  documents: PatientDoc[];
  referral: Referral;
  /** Controls staff-only hints and AI approval controls. */
  audience: "bhw" | "hospital";
  onExplainAction?: (payload: ExplainInstructionsPayload) => void;
  actions?: ReactNode;
}

export function CaseDetail({
  patient,
  barangayName,
  screening,
  documents,
  referral,
  audience,
  onExplainAction,
  actions,
}: CaseDetailProps) {
  return (
    <div className={styles.detailColumn}>
      <section className={styles.card}>
        <div className={styles.patientHero}>
          <div>
            <p className={styles.eyebrow}>{referral.id}</p>
            <h2 className={styles.patientHeroName}>{patient.name}</h2>
            <p className={styles.patientMeta}>{patient.age} years · {barangayName}</p>
          </div>
          <StatusBadge status={referral.status} />
        </div>

        {referral.moreInfoReason ? (
          <div className={styles.section}>
            <div className={`${styles.notice} ${styles.warning}`}>
              <strong>Hospital requested more information</strong><br />
              {referral.moreInfoReason}
            </div>
          </div>
        ) : null}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Screening findings</h3>
          <div className={styles.factGrid}>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Measurement date</span>
              <p className={styles.factValue}>{formatManilaDateTime(screening.measuredAt)}</p>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Blood-pressure readings</span>
              <p className={styles.bpReading}>
                {screening.readings.map((reading) => `${reading.systolic}/${reading.diastolic}`).join(" · ")} <span className={styles.bpUnit}>mmHg</span>
              </p>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Relevant history</span>
              <p className={styles.factValue}>{screening.history}</p>
            </div>
            <div className={styles.fact}>
              <span className={styles.factLabel}>Reason for referral</span>
              <p className={styles.factValue}>{screening.reasonForReferral}</p>
            </div>
          </div>
          <p className={styles.clinicalDisclaimer}>Screening readings are recorded findings, not a diagnosis or clinical algorithm.</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Available original documents</h3>
          <p className={styles.sectionHint}>Mock metadata only. No file is stored and no document authenticity is claimed.</p>
          {documents.length ? (
            <div className={styles.documentList}>
              {documents.map((document) => (
                <div className={styles.document} key={document.id}>
                  <span className={styles.documentIcon} aria-hidden="true">DOC</span>
                  <div>
                    <p className={styles.documentName}>{document.fileName}</p>
                    <p className={styles.documentMeta}>
                      {DOCUMENT_TYPE_LABEL[document.type]} · {formatManilaDate(document.documentDate)} · mock attachment
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.notice}>No documents were attached. A referral can still be reviewed.</p>
          )}
        </div>
      </section>

      {referral.appointment ? (
        <div className="mt-3.5">
          <AppointmentCard appointment={referral.appointment} demo />
        </div>
      ) : (
        <section className={`${styles.card} ${styles.cardBody}`}>
          <h3 className={styles.sectionTitle}>No appointment confirmed</h3>
          <p className={styles.notice}>
            This is a referral, not an appointment. Hospital staff must accept it and confirm a date and instructions.
          </p>
        </section>
      )}

      {referral.appointment ? (
        <div className="mt-3.5">
          <ExplainInstructions referral={referral} onAction={audience === "hospital" ? onExplainAction : undefined} />
        </div>
      ) : null}

      {referral.outcome ? (
        <section className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.outcomeCard}>
              <p className={styles.outcomeLabel}>Clinical outcome · demo data</p>
              <h3 className={styles.outcomeTitle}>{OUTCOME_LABEL[referral.outcome.kind]}</h3>
              {referral.outcome.diagnosis ? <p><strong>{referral.outcome.diagnosis}</strong></p> : null}
              <p>{referral.outcome.explanation}</p>
              <p><strong>Next / follow-up action:</strong> {referral.outcome.nextAction}</p>
              <p className={styles.clinicalDisclaimer}>
                Recorded {formatManilaDateTime(referral.outcome.recordedAt)}. Assessment completed does not mean cured or that follow-up is finished.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {actions}

      <details className={styles.card}>
        <summary className={styles.cardHeader}>
          <span className={styles.cardHeaderText}>
            <strong>Activity history</strong>
            <p>{referral.activity.length} recorded event{referral.activity.length === 1 ? "" : "s"}</p>
          </span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className={styles.cardBody}>
          <div className={styles.timeline}>
            {[...referral.activity].reverse().map((activity) => (
              <div className={styles.timelineItem} key={activity.id}>
                <p className={styles.timelineText}>{activity.text}</p>
                <p className={styles.timelineMeta}>{activity.actor} · {formatManilaDateTime(activity.at)}</p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
