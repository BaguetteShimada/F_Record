export interface RecordToggleLabels {
    enabled: string;
    disabled: string;
}

export function getRecordToggleLabel(isEnabled: boolean, labels: RecordToggleLabels): string {
    return isEnabled ? labels.enabled : labels.disabled;
}
