import type { Referral } from "../types";
import styles from "../vitality.module.css";

export interface ExplainInstructionsPayload {
  referralId: string;
  action: "generate" | "approve";
}

export interface ExplainInstructionsProps {
  referral: Referral;
  /** Hospital-only approval callback. Patient/BHW views omit it. */
  onAction?: (payload: ExplainInstructionsPayload) => void;
}

export function ExplainInstructions({ referral, onAction }: ExplainInstructionsProps) {
  if (!referral.appointment) return null;
  const draft = referral.explainDraft;

  return (
    <details className={styles.aiArea}>
      <summary>
        <span>✦ Explain approved instructions</span>
        <span className={`${styles.badge} ${draft?.approved ? styles.badgeCompleted : styles.badgeAttention}`}>
          {draft?.approved ? "Staff approved wording" : "Optional AI draft"}
        </span>
      </summary>
      <div className={styles.aiBody}>
        <p>
          This optional area can simplify approved hospital instructions. The original instructions above remain the source of truth.
        </p>
        {draft ? (
          <div className={styles.aiDraft}>
            <span className={`${styles.badge} ${draft.approved ? styles.badgeCompleted : styles.badgeAttention}`}>
              {draft.approved ? "Reviewed by demo hospital staff" : "AI wording — draft, not approved"}
            </span>
            <p>{draft.text}</p>
            {!draft.approved && onAction ? (
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => onAction({ referralId: referral.id, action: "approve" })}
              >
                Approve wording after checking original
              </button>
            ) : null}
          </div>
        ) : onAction ? (
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => onAction({ referralId: referral.id, action: "generate" })}
          >
            Generate mock explanation draft
          </button>
        ) : (
          <p className={styles.notice}>No staff-approved explanation is available. Follow the original hospital instructions.</p>
        )}
        <p className={styles.aiBoundary}>
          AI does not select treatment, invent preparation instructions, or confirm appointments.
        </p>
      </div>
    </details>
  );
}
