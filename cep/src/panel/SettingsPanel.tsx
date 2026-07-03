import * as React from 'react';
import { TextField, Tooltip, TooltipTrigger, ContextualHelp, Content } from "@adobe/react-spectrum";
import { Text } from "@adobe/react-spectrum";
import { Picker } from "@adobe/react-spectrum";
import { ActionButton, Item } from "@adobe/react-spectrum";
import FolderOpen from '@spectrum-icons/workflow/FolderOpen';
import { useTranslation } from 'react-i18next';
import type { ConfigData } from './models';

interface SettingsPanelProps {
    configData: React.MutableRefObject<ConfigData>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
}

function SettingsPanel({configData, onConfigChange}: SettingsPanelProps) {
    const { t , i18n } = useTranslation();

    return(
        <div className="fr-settings">
            <div className="fr-settings-section">
                <Text marginBottom="size-100">{t('Process Image Folder')}</Text>
                <div className="fr-settings-folder-row">
                    <TextField
                        aria-label="Process Image Folder"
                        value={configData.current.processImageFolderPath}
                        isReadOnly
                        width="100%"
                    />
                    <TooltipTrigger delay={0}>
                        <ActionButton
                            aria-label="Select Process Image Folder"
                            onPress={() => {
                                const result = window.cep.fs.showOpenDialog(false, true, t("Select Process Image Folder"), configData.current.processImageFolderPath);
                                if (result.err === 0 && result.data.length > 0) {
                                    onConfigChange({
                                        processImageFolderPath: result.data[0]
                                    });
                                }
                            }}
                            >
                            <FolderOpen />
                            </ActionButton>
                        <Tooltip>{t('select folder')}</Tooltip>
                    </TooltipTrigger>
                </div>
            </div>
            <div className="fr-settings-section">
                <div className="fr-settings-row">
                    <div className="fr-settings-label">
                        <Text>{t('Resolution')}</Text>
                    </div>
                    <Picker aria-label="Resolution"
                        selectedKey={configData.current.resolution}
                        onSelectionChange={(key) => {
                            onConfigChange({
                                resolution: String(key)
                            });
                        }}
                        width="size-1200">
                        <Item key="360">360p</Item>
                        <Item key="720">720p</Item>
                        <Item key="1080">1080p</Item>
                        <Item key="1440">1440p</Item>
                    </Picker>
                </div>
                <div className="fr-settings-row">
                    <div className="fr-settings-label">
                        <Text marginEnd="size-100">{t('Quality')}</Text>
                        <ContextualHelp variant="help" placement="top start">
                            <Content>
                                <Text>
                                    {t('The higher the Quality you select, the lower the compression rate applied to the image.')}
                                </Text>
                            </Content>
                        </ContextualHelp>
                    </div>
                    <Picker aria-label="Quality"
                        selectedKey={configData.current.quality}
                        onSelectionChange={(key) => {
                            onConfigChange({
                                quality: String(key)
                            });
                        }}
                        width="size-1200">
                        <Item key="20">{t('low')}</Item>
                        <Item key="70">{t('medium')}</Item>
                        <Item key="90">{t('high')}</Item>
                    </Picker>
                </div>
                <div className="fr-settings-row">
                    <div className="fr-settings-label">
                        <Text marginEnd="size-100">{t('Idle Timeout')}</Text>
                        <ContextualHelp variant="help" placement="top start">
                            <Content>
                                <Text>
                                    {t('When the time elapsed since the last painting exceeds the preset duration, the timer will automatically stop.')}
                                </Text>
                            </Content>
                        </ContextualHelp>
                    </div>
                    <Picker aria-label="Idle Timeout"
                        selectedKey={configData.current.idleTimeout}
                        onSelectionChange={(key) => {
                            onConfigChange({
                                idleTimeout: String(key)
                            });
                        }}
                        width="size-1200">
                        <Item key="1">{1 + t('min')}</Item>
                        <Item key="5">{5 + t('min')}</Item>
                        <Item key="10">{10 + t('min')}</Item>
                        <Item key="30">{30 + t('min')}</Item>
                        <Item key="0">{t('Off')}</Item>
                    </Picker>
                </div>
            </div>
            <div className="fr-settings-row">
                <div className="fr-settings-label">
                    <Text>{t('Language')}</Text>
                </div>
                <Picker
                    aria-label="Language"
                    selectedKey={configData.current.language}
                    onSelectionChange={(key) => {
                        const value = String(key);
                        i18n.changeLanguage(value);
                        onConfigChange({
                            language: value
                        });
                    }}
                    width="size-1200"
                >
                    <Item key="cn">中文</Item>
                    <Item key="en">English</Item>
                </Picker>
            </div>
        </div>
    )
}

export default SettingsPanel;
