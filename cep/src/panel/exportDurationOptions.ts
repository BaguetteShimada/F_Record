export const replayDurationPresets = [15, 30, 60, 180] as const;

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
