import type { ExportSettings } from './models';

export type ExportStringOptionKey = 'aspectRatio' | 'duration';
type SelectionKey = string | number;

export function applyExportStringOptionChange(
    optionKey: ExportStringOptionKey,
    selectedKey: SelectionKey,
    onExportSettingsChange: (exportSettingsChange: Partial<Pick<ExportSettings, ExportStringOptionKey>>) => void
): void {
    const value = String(selectedKey);
    switch (optionKey) {
        case 'aspectRatio':
            onExportSettingsChange({ aspectRatio: value });
            break;
        case 'duration':
            onExportSettingsChange({ duration: value });
            break;
    }
}
