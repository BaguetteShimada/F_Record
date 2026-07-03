type ExportErrorDetailsViewer = (error: unknown) => void;

export function showExportErrorDetails(
    error: unknown,
    onError: (error: unknown) => void,
    viewer: ExportErrorDetailsViewer = showError
): void {
    try {
        viewer(error);
    } catch (detailsError) {
        onError(detailsError);
    }
}
