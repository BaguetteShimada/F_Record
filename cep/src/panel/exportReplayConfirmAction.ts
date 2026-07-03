import { createDefaultExportProgress } from './models';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { createFinishExportSettingsChange } from './exportSettingsActions';
import { openExportedVideo } from './exportVideoActions';
import {
    showExportFailureToast,
    showExportStartedToast,
    showExportSuccessToast,
    type ExportToastQueue,
} from './exportNotifications';
import { runExportReplayFlow } from './exportReplayFlow';
import { createExportReplayStart } from './exportStartActions';
import { showExportErrorDetails } from './exportErrorDetailsActions';

type ExportTranslator = (key: string, values?: Record<string, string>) => string;

export interface ConfirmExportReplayOptions {
    configData: ConfigData;
    documentValue: CurrentDocumentValue;
    exportSettings: ExportSettings;
    t: ExportTranslator;
    close: () => void;
    setProgress: (progress: ExportProgress) => void;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
    onError: (error: unknown) => void;
    toastQueue: ExportToastQueue;
}

export async function confirmExportReplay({
    configData,
    documentValue,
    exportSettings,
    t,
    close,
    setProgress,
    onExportSettingsChange,
    onError,
    toastQueue,
}: ConfirmExportReplayOptions): Promise<boolean> {
    const exportStart = createExportReplayStart(exportSettings, documentValue.name, t);
    if (exportStart === null) {
        return false;
    }

    onExportSettingsChange(exportStart.settingsChange);
    close();

    setProgress(createDefaultExportProgress());
    showExportStartedToast(t, toastQueue);

    try {
        await runExportReplayFlow(configData, documentValue, exportStart.nextExportSettings, (nowProgress) => {
            setProgress(nowProgress);
        });
        showExportSuccessToast(t, toastQueue, () => openExportedVideo(exportStart.savePath, onError));
    } catch (error) {
        showExportFailureToast(error, t, toastQueue, () => showExportErrorDetails(error, onError));
    } finally {
        onExportSettingsChange(createFinishExportSettingsChange());
    }

    return true;
}
