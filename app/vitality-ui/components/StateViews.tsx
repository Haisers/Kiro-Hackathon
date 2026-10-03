import styles from "../vitality.module.css";

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.state} role="status">
      <div>
        <div className={styles.stateIcon} aria-hidden="true">○</div>
        <h2>{title}</h2>
        <p>{message}</p>
        {actionLabel && onAction ? (
          <button className={styles.secondaryButton} type="button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <div>
        <div className={`${styles.stateIcon} ${styles.dangerNotice}`} aria-hidden="true">!</div>
        <h2>Couldn’t load the demo</h2>
        <p>{message}</p>
        <button className={styles.secondaryButton} type="button" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <div>
        <div className={styles.spinner} aria-hidden="true" />
        <p>Loading fictional Vitality cases…</p>
      </div>
    </div>
  );
}

export interface SaveToastProps {
  message: string;
  onDismiss: () => void;
}

export function SaveToast({ message, onDismiss }: SaveToastProps) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span>✓ {message}</span>
      <button type="button" aria-label="Dismiss message" onClick={onDismiss}>×</button>
    </div>
  );
}
