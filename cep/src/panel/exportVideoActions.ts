type LocalPathOpener = (targetPath: string) => void;

export function openExportedVideo(
    savePath: string,
    onError: (error: unknown) => void,
    opener: LocalPathOpener = openLocalPath
): void {
    try {
        opener(savePath);
    } catch (error) {
        onError(error);
    }
}
