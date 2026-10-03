import type { Appointment } from "../types";
import { formatManilaDateTime } from "../utils";
import styles from "../vitality.module.css";
import { AttendanceBadge } from "./StatusBadge";

export interface AppointmentCardProps {
  /** A hospital-confirmed appointment. Never render this for an unaccepted referral. */
  appointment: Appointment;
  /** Adds an explicit demo-data marker to staff preview screens. */
  demo?: boolean;
  prominent?: boolean;
}

export function AppointmentCard({ appointment, demo = true, prominent = false }: AppointmentCardProps) {
  return (
    <section className={styles.appointmentCard} aria-labelledby={`appointment-${appointment.id}`}>
      <div className={styles.appointmentTop}>
        <div>
          <p className={styles.appointmentKicker}>
            Confirmed appointment {demo ? "· demo slot" : ""}
          </p>
          <h2 id={`appointment-${appointment.id}`} className={styles.appointmentWhen}>
            {formatManilaDateTime(appointment.scheduledAt)}
          </h2>
        </div>
        <AttendanceBadge attendance={appointment.attendance} />
      </div>
      <div className={styles.appointmentGrid}>
        <div className={styles.appointmentFact}>
          <span className={styles.factLabel}>Where</span>
          <p className={styles.factValue}>
            <strong>{appointment.facility}</strong><br />
            {appointment.departmentOrLocation}
          </p>
        </div>
        <div className={styles.appointmentFact}>
          <span className={styles.factLabel}>What to bring</span>
          <p className={styles.factValue}>{appointment.whatToBring}</p>
        </div>
        <div className={`${styles.appointmentFact} ${styles.appointmentWide}`}>
          <span className={styles.factLabel}>Approved preparation instructions</span>
          <p className={styles.originalInstructions}>{appointment.preparationInstructions}</p>
          <p className={styles.helpText}>Original hospital instructions — always kept visible.</p>
        </div>
        <div className={`${styles.appointmentFact} ${styles.appointmentWide}`}>
          <span className={styles.factLabel}>Contact</span>
          <p className={styles.factValue}>{appointment.contact}</p>
        </div>
      </div>
      {prominent ? (
        <p className={styles.clinicalDisclaimer}>
          If you cannot attend, contact the hospital or your BHW. This demo does not provide emergency advice.
        </p>
      ) : null}
    </section>
  );
}
