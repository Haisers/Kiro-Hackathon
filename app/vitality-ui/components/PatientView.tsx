import type { Referral, VitalityData } from "../types";
import { OUTCOME_LABEL } from "../types";
import { formatManilaDateTime, getBarangay, getPatient } from "../utils";
import styles from "../vitality.module.css";
import { AppointmentCard } from "./AppointmentCard";
import { ExplainInstructions } from "./ExplainInstructions";
import { ReferralProgress } from "./ReferralProgress";
import { StatusBadge } from "./StatusBadge";

export interface PatientViewProps {
  /** Patient view receives exactly one selected case and never renders a queue. */
  data: VitalityData;
  referral: Referral;
}

export function PatientView({ data, referral }: PatientViewProps) {
  const patient = getPatient(data, referral.patientId);
  const barangay = getBarangay(data, patient.barangayId);

  return (
    <main className={`${styles.content} ${styles.patientPage}`}>
      <header className={styles.patientHeader}>
        <p className={styles.eyebrow}>Patient view · fictional demo</p>
        <h1>Hello, {patient.name.split(" ")[0]}.</h1>
        <p>{barangay.name} · Only your selected case is shown here.</p>
      </header>

      <div className={styles.selectedPatientNotice}>
        <StatusBadge status={referral.status} />
      </div>

      {referral.appointment ? (
        <AppointmentCard appointment={referral.appointment} prominent demo />
      ) : (
        <section className={`${styles.card} ${styles.cardBody}`}>
          <h2 className={styles.sectionTitle}>No appointment confirmed yet</h2>
          <p className={`${styles.notice} ${styles.warning}`}>
            Your BHW sent a referral. It becomes an appointment only after hospital staff confirm the place, date, and instructions.
          </p>
          {referral.moreInfoReason ? <p className={styles.queueReason}>Your BHW is helping provide more information requested by the hospital.</p> : null}
        </section>
      )}

      {referral.appointment ? <ExplainInstructions referral={referral} /> : null}

      <section className={styles.card}>
        <div className={styles.cardHeader}><div className={styles.cardHeaderText}><h2>Referral progress</h2><p>A simple view of what happens next.</p></div></div>
        <div className={styles.cardBody}><ReferralProgress status={referral.status} /></div>
      </section>

      {referral.outcome ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}><div className={styles.cardHeaderText}><h2>Assessment outcome</h2><p>Clinical outcome · clearly marked demo data</p></div></div>
          <div className={styles.cardBody}>
            <div className={styles.outcomeCard}>
              <p className={styles.outcomeLabel}>Demo clinical outcome</p>
              <h3 className={styles.outcomeTitle}>{OUTCOME_LABEL[referral.outcome.kind]}</h3>
              {referral.outcome.diagnosis ? <p><strong>{referral.outcome.diagnosis}</strong></p> : null}
              <p>{referral.outcome.explanation}</p>
              <p><strong>Your next step:</strong> {referral.outcome.nextAction}</p>
              <p className={styles.clinicalDisclaimer}>Returned {formatManilaDateTime(referral.outcome.recordedAt)}. Assessment completed does not mean cured or that follow-up is finished.</p>
            </div>
          </div>
        </section>
      ) : (
        <section className={`${styles.card} ${styles.cardBody}`}>
          <h2 className={styles.sectionTitle}>Assessment outcome</h2>
          <p className={styles.notice}>No outcome has been returned yet. The hospital team will send the explanation and next step after assessment.</p>
        </section>
      )}

      <p className={styles.clinicalDisclaimer}>Vitality demo · This page contains fictional information and does not provide medical advice or emergency support.</p>
    </main>
  );
}
