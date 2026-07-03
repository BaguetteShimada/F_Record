import type { ExportProgress, ExportReplayParams } from './models';

interface CepOpenDialogResult {
    err: number;
    data: string[];
}

interface CepSaveDialogResult {
    err: number;
    data: string;
}

interface PhotoshopHostEnvironment {
    appSkinInfo: {
        appBarBackgroundColor: {
            color: {
                red: number;
            };
        };
    };
}

interface CepFsApi {
    showOpenDialog(
        allowMultipleSelection: boolean,
        chooseDirectory: boolean,
        title: string,
        initialPath?: string
    ): CepOpenDialogResult;
    showSaveDialogEx(
        title: string,
        initialPath: string,
        fileTypes: string[],
        defaultName: string,
        friendlyFilePrefix?: string
    ): CepSaveDialogResult;
}

interface CepUtilApi {
    openURLInDefaultBrowser(url: string): void;
}

interface CepWindowApi {
    fs: CepFsApi;
    util: CepUtilApi;
}

interface PhotoshopCsInterface {
    getHostEnvironment(): PhotoshopHostEnvironment;
    addEventListener(eventName: string, listener: () => void): void;
    removeEventListener(eventName: string, listener: () => void): void;
    evalScript(script: string, callback?: (result: string) => void): void;
    getExtensionID(): string;
    getApplicationID(): string;
    dispatchEvent(event: unknown): void;
}

declare global {
    interface Window {
        cep: CepWindowApi;
    }

    const cs: PhotoshopCsInterface;
    const EvalScript_ErrMessage: string;

    function getUserDirectory(): string;
    function isExist(targetPath: string): boolean;
    function createDir(targetPath: string): void;
    function writeFile(targetPath: string, content: string): void;
    function readFile(targetPath: string): string;
    function readDir(targetPath: string): string[];
    function unlinkFile(targetPath: string): void;
    function deleteDir(targetPath: string): void;
    function openLocalPath(targetPath: string): void;
    function showError(error: unknown): void;
    function persistentPanel(): void;
    function validateExportBinaries(): void;
    function exportReplay(
        exportParams: ExportReplayParams,
        onProgress: (progress: ExportProgress) => void
    ): Promise<void>;
}

export {};
