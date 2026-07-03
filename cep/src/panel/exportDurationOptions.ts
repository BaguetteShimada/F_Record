export const replayDurationPresets = [15, 30, 60, 180] as const;

export interface ReplayDurationOption {
    key: string;
    durationSeconds: number;
    isOriginal: boolean;
}

export function estimateReplayDurationSeconds(
    imageCount: number | null | undefined,
    fps: number
): number {
    return Math.floor((imageCount ?? 0) / fps) + 3;
}

export function getReplayDurationPresetSeconds(
    imageCount: number | null | undefined,
    fps: number
): number[] {
    const estimatedDuration = estimateReplayDurationSeconds(imageCount, fps);
    return replayDurationPresets.filter(duration => duration < estimatedDuration);
}

export function getReplayDurationOptions(
    imageCount: number | null | undefined,
    fps: number
): ReplayDurationOption[] {
    const estimatedDuration = estimateReplayDurationSeconds(imageCount, fps);
    return [
        ...getReplayDurationPresetSeconds(imageCount, fps).map(duration => ({
            key: String(duration),
            durationSeconds: duration,
            isOriginal: false,
        })),
        {
            key: "0",
            durationSeconds: estimatedDuration,
            isOriginal: true,
        },
    ];
}
