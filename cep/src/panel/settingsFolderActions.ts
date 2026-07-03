import type { ConfigData } from './models';

interface OpenFolderDialogResult {
    err: number;
    data: string[];
}

interface FolderDialogApi {
    showOpenDialog(
        allowMultipleSelection: boolean,
        chooseDirectory: boolean,
        title: string,
        initialPath?: string
    ): OpenFolderDialogResult;
}

export function selectProcessImageFolder(
    currentPath: string,
    dialogTitle: string,
    onConfigChange: (configChange: Pick<ConfigData, 'processImageFolderPath'>) => void,
    dialogApi: FolderDialogApi = window.cep.fs
): void {
    const result = dialogApi.showOpenDialog(false, true, dialogTitle, currentPath);
    if (result.err === 0 && result.data.length > 0) {
        onConfigChange({
            processImageFolderPath: result.data[0]
        });
    }
}
