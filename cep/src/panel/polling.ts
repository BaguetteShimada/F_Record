export const PANEL_SYNC_POLL_INTERVAL_MS = 500;

type TimerWindow = Pick<Window, 'setInterval' | 'clearInterval'>;

export function startPanelPolling(
    callback: () => void,
    timerWindow: TimerWindow = window,
    pollIntervalMs = PANEL_SYNC_POLL_INTERVAL_MS
): () => void {
    callback();
    const intervalId = timerWindow.setInterval(callback, pollIntervalMs);
    return () => timerWindow.clearInterval(intervalId);
}
