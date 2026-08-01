import * as React from 'react';
import { Item } from "@adobe/react-spectrum";
import { useTranslation } from 'react-i18next';
import type { ConfigData } from './models';
import { selectProcessImageFolder } from './settingsFolderActions';
import { applyLanguageChange } from './settingsLanguageActions';
import { applySettingsStringConfigChange } from './settingsConfigActions';
import SettingsPickerRow from './SettingsPickerRow';
import SettingsFolderSection from './SettingsFolderSection';
import {
    IDLE_TIMEOUT_MINUTE_OPTIONS,
    LANGUAGE_OPTIONS,
    QUALITY_OPTIONS,
    RESOLUTION_OPTIONS,
} from './settingsOptions';

interface SettingsPanelProps {
    configData: React.MutableRefObject<ConfigData>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
}

function SettingsPanel({configData, onConfigChange}: SettingsPanelProps) {
    const { t , i18n } = useTranslation();

    return(
        <div className="fr-panel-page fr-settings">
            <SettingsFolderSection
                label={t('Process Image Folder')}
                value={configData.current.processImageFolderPath}
                buttonLabel="Select Process Image Folder"
                tooltipLabel={t('select folder')}
                onSelectFolder={() => {
                    selectProcessImageFolder(configData.current.processImageFolderPath, t("Select Process Image Folder"), onConfigChange);
                }}
            />
            <div className="fr-panel-section fr-settings-section">
                <SettingsPickerRow
                    label={t('Resolution')}
                    ariaLabel="Resolution"
                    selectedKey={configData.current.resolution}
                    onSelectionChange={(key) => {
                        applySettingsStringConfigChange('resolution', key, onConfigChange);
                    }}
                >
                    {RESOLUTION_OPTIONS.map((resolution) => (
                        <Item key={resolution}>{resolution}p</Item>
                    ))}
                </SettingsPickerRow>
                <SettingsPickerRow
                    label={t('Quality')}
                    ariaLabel="Quality"
                    selectedKey={configData.current.quality}
                    onSelectionChange={(key) => {
                        applySettingsStringConfigChange('quality', key, onConfigChange);
                    }}
                    helpText={t('The higher the Quality you select, the lower the compression rate applied to the image.')}
                >
                    {QUALITY_OPTIONS.map((option) => (
                        <Item key={option.key}>{t(option.labelKey)}</Item>
                    ))}
                </SettingsPickerRow>
                <SettingsPickerRow
                    label={t('Idle Timeout')}
                    ariaLabel="Idle Timeout"
                    selectedKey={configData.current.idleTimeout}
                    onSelectionChange={(key) => {
                        applySettingsStringConfigChange('idleTimeout', key, onConfigChange);
                    }}
                    helpText={t('When the time elapsed since the last painting exceeds the preset duration, the timer will automatically stop.')}
                >
                    {[
                        ...IDLE_TIMEOUT_MINUTE_OPTIONS.map((minutes) => (
                            <Item key={String(minutes)}>{minutes + t('min')}</Item>
                        )),
                        <Item key="0">{t('Off')}</Item>,
                    ]}
                </SettingsPickerRow>
                <SettingsPickerRow
                    label={t('Language')}
                    ariaLabel="Language"
                    selectedKey={configData.current.language}
                    onSelectionChange={(key) => {
                        applyLanguageChange(String(key), i18n, onConfigChange);
                    }}
                >
                    {LANGUAGE_OPTIONS.map((option) => (
                        <Item key={option.key}>{option.label}</Item>
                    ))}
                </SettingsPickerRow>
            </div>
        </div>
    )
}

export default SettingsPanel;
