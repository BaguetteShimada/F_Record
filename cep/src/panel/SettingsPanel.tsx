import * as React from 'react';
import { Item } from "@adobe/react-spectrum";
import { useTranslation } from 'react-i18next';
import type { ConfigData } from './models';
import { selectProcessImageFolder } from './settingsFolderActions';
import { applyLanguageChange } from './settingsLanguageActions';
import SettingsPickerRow from './SettingsPickerRow';
import SettingsFolderSection from './SettingsFolderSection';

interface SettingsPanelProps {
    configData: React.MutableRefObject<ConfigData>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
}

function SettingsPanel({configData, onConfigChange}: SettingsPanelProps) {
    const { t , i18n } = useTranslation();

    return(
        <div className="fr-settings">
            <SettingsFolderSection
                label={t('Process Image Folder')}
                value={configData.current.processImageFolderPath}
                buttonLabel="Select Process Image Folder"
                tooltipLabel={t('select folder')}
                onSelectFolder={() => {
                    selectProcessImageFolder(configData.current.processImageFolderPath, t("Select Process Image Folder"), onConfigChange);
                }}
            />
            <div className="fr-settings-section">
                <SettingsPickerRow
                    label={t('Resolution')}
                    ariaLabel="Resolution"
                    selectedKey={configData.current.resolution}
                    onSelectionChange={(key) => {
                        onConfigChange({
                            resolution: String(key)
                        });
                    }}
                >
                    <Item key="360">360p</Item>
                    <Item key="720">720p</Item>
                    <Item key="1080">1080p</Item>
                    <Item key="1440">1440p</Item>
                </SettingsPickerRow>
                <SettingsPickerRow
                    label={t('Quality')}
                    ariaLabel="Quality"
                    selectedKey={configData.current.quality}
                    onSelectionChange={(key) => {
                        onConfigChange({
                            quality: String(key)
                        });
                    }}
                    helpText={t('The higher the Quality you select, the lower the compression rate applied to the image.')}
                >
                    <Item key="20">{t('low')}</Item>
                    <Item key="70">{t('medium')}</Item>
                    <Item key="90">{t('high')}</Item>
                </SettingsPickerRow>
                <SettingsPickerRow
                    label={t('Idle Timeout')}
                    ariaLabel="Idle Timeout"
                    selectedKey={configData.current.idleTimeout}
                    onSelectionChange={(key) => {
                        onConfigChange({
                            idleTimeout: String(key)
                        });
                    }}
                    helpText={t('When the time elapsed since the last painting exceeds the preset duration, the timer will automatically stop.')}
                >
                    <Item key="1">{1 + t('min')}</Item>
                    <Item key="5">{5 + t('min')}</Item>
                    <Item key="10">{10 + t('min')}</Item>
                    <Item key="30">{30 + t('min')}</Item>
                    <Item key="0">{t('Off')}</Item>
                </SettingsPickerRow>
            </div>
            <SettingsPickerRow
                label={t('Language')}
                ariaLabel="Language"
                selectedKey={configData.current.language}
                onSelectionChange={(key) => {
                    applyLanguageChange(String(key), i18n, onConfigChange);
                }}
            >
                <Item key="cn">中文</Item>
                <Item key="en">English</Item>
            </SettingsPickerRow>
        </div>
    )
}

export default SettingsPanel;
