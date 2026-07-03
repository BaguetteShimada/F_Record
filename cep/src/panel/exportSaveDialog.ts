interface SaveDialogResult {
    err: number;
    data: string;
}

interface SaveDialogApi {
    showSaveDialogEx(
        title: string,
        initialPath: string,
        fileTypes: string[],
        defaultName: string,
        friendlyFilePrefix?: string
    ): SaveDialogResult;
}

export function selectExportSavePath(
    documentName: string | null | undefined,
    dialogTitle: string,
    dialogApi: SaveDialogApi = window.cep.fs
): string | null {
    const result = dialogApi.showSaveDialogEx(
        dialogTitle,
        "",
        ["mp4"],
        `${documentName || ""}.mp4`,
        "MP4 (*.mp4)"
    );
    return result.err === 0 && result.data !== "" ? result.data : null;
}
