import type { ExportSettings } from './models';

export type StartExportSettingsChange = Pick<ExportSettings, 'savePath' | 'isExporting'>;
export type FinishExportSettingsChange = Pick<ExportSettings, 'isExporting'>;

export function createStartedExportSettings(currentExportSettings: ExportSettings, savePath: string): ExportSettings {
    return {
        ...currentExportSettings,
        savePath,
        isExporting: true,
    };
}

export function createStartExportSettingsChange(savePath: string): StartExportSettingsChange {
    return {
        savePath,
        isExporting: true,
    };
}

export function createFinishExportSettingsChange(): FinishExportSettingsChange {
    return {
        isExporting: false,
    };
}
