import type { ReferralStatus } from "../types";
import styles from "../vitality.module.css";

export interface ReferralProgressProps {
  status: ReferralStatus;
}

interface ProgressStep {
  label: string;
  detail: string;
}

const STEPS: ProgressStep[] = [
  { label: "Referral sent", detail: "The BHW sent screening information." },
  { label: "Hospital review", detail: "Hospital staff review the case." },
  { label: "Appointment", detail: "Only confirmed after hospital staff schedule it." },
  { label: "Assessment outcome", detail: "The outcome and next step are returned." },
];

function currentStep(status: ReferralStatus): number {
  if (status === "draft") return 0;
  if (status === "submitted" || status === "more_info_needed") return 1;
  if (status === "appointment_confirmed") return 2;
  return 3;
}

export function ReferralProgress({ status }: ReferralProgressProps) {
  const current = currentStep(status);
  return (
    <div className={styles.progress} aria-label="Referral progress">
      {STEPS.map((step, index) => {
        const done = index < current || (index === 3 && status === "assessment_completed");
        const active = index === current && !done;
        return (
          <div className={styles.progressItem} key={step.label}>
            <span
              className={`${styles.progressDot} ${done ? styles.progressDone : ""} ${active ? styles.progressCurrent : ""}`}
              aria-hidden="true"
            >
              {done ? "✓" : index + 1}
            </span>
            <div className={styles.progressLabel}>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
