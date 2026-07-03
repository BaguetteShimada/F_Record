export interface TimeUnitLabels {
    hours: string;
    minutes: string;
    seconds: string;
}

export function formatElapsedTime(totalSeconds: number | null | undefined, labels: TimeUnitLabels): string {
    const normalizedSeconds = Math.max(0, Math.floor(totalSeconds ?? 0));
    const hours = Math.floor(normalizedSeconds / 3600);
    const minutes = Math.floor((normalizedSeconds % 3600) / 60);
    const seconds = normalizedSeconds % 60;

    if (hours > 0) {
        return `${hours}${labels.hours} ${minutes}${labels.minutes}`;
    }
    if (minutes > 0) {
        return `${minutes}${labels.minutes} ${seconds}${labels.seconds}`;
    }
    return `${seconds}${labels.seconds}`;
}
