import type { CurrentDocumentValue, ExportSettings } from './models';
import { selectExportSavePath } from './exportSaveDialog';
import {
    createStartedExportSettings,
    createStartExportSettingsChange,
    type StartExportSettingsChange,
} from './exportSettingsActions';

type SavePathSelector = typeof selectExportSavePath;
type ExportStartTranslator = (key: string) => string;

export interface ExportReplayStart {
    savePath: string;
    nextExportSettings: ExportSettings;
    settingsChange: StartExportSettingsChange;
}

export function createExportReplayStart(
    currentExportSettings: ExportSettings,
    documentName: CurrentDocumentValue['name'],
    t: ExportStartTranslator,
    selectSavePath: SavePathSelector = selectExportSavePath
): ExportReplayStart | null {
    const savePath = selectSavePath(documentName, t("Select Export Path"));
    if (savePath === null) {
        return null;
    }

    return {
        savePath,
        nextExportSettings: createStartedExportSettings(currentExportSettings, savePath),
        settingsChange: createStartExportSettingsChange(savePath),
    };
}
