import type { Attendance, ReferralStatus } from "../types";
import { ATTENDANCE_LABEL, REFERRAL_STATUS_LABEL } from "../types";
import styles from "../vitality.module.css";

export interface StatusBadgeProps {
  /** Referral status value; displayed with text as well as color. */
  status: ReferralStatus;
}

const STATUS_STYLE: Record<ReferralStatus, string> = {
  draft: styles.badgeDraft,
  submitted: styles.badgeSubmitted,
  more_info_needed: styles.badgeAttention,
  appointment_confirmed: styles.badgeConfirmed,
  awaiting_outcome: styles.badgeAttention,
  further_assessment_needed: styles.badgeAttention,
  assessment_completed: styles.badgeCompleted,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${STATUS_STYLE[status]}`}>
      {REFERRAL_STATUS_LABEL[status]}
    </span>
  );
}

export interface AttendanceBadgeProps {
  /** Attendance is deliberately separate from referral status. */
  attendance: Attendance;
}

const ATTENDANCE_STYLE: Record<Attendance, string> = {
  unconfirmed: styles.badgeNeutral,
  attended: styles.badgeCompleted,
  missed: styles.badgeMissed,
};

export function AttendanceBadge({ attendance }: AttendanceBadgeProps) {
  return (
    <span className={`${styles.badge} ${ATTENDANCE_STYLE[attendance]}`}>
      {ATTENDANCE_LABEL[attendance]}
    </span>
  );
}
