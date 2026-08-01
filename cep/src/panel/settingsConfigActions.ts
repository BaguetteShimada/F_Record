import {
    normalizeIdleTimeout,
    normalizeQuality,
    normalizeResolution,
    type ConfigData,
} from './models';

export type SettingsStringConfigKey = 'resolution' | 'quality' | 'idleTimeout';
type SelectionKey = string | number;

export function applySettingsStringConfigChange(
    configKey: SettingsStringConfigKey,
    selectedKey: SelectionKey,
    onConfigChange: (configChange: Partial<Pick<ConfigData, SettingsStringConfigKey>>) => void
): void {
    const value = String(selectedKey);
    switch (configKey) {
        case 'resolution':
            onConfigChange({ resolution: normalizeResolution(value) });
            break;
        case 'quality':
            onConfigChange({ quality: normalizeQuality(value) });
            break;
        case 'idleTimeout':
            onConfigChange({ idleTimeout: normalizeIdleTimeout(value) });
            break;
    }
}
