import * as React from 'react';
import { ActionButton, TooltipTrigger, Tooltip, Link } from "@adobe/react-spectrum";
import { TextField } from "@adobe/react-spectrum";
import { Text } from "@adobe/react-spectrum";
import ExportReplayButton from "./ExportReplayButton";
import FolderOpen from '@spectrum-icons/workflow/FolderOpen';
import Clock from '@spectrum-icons/workflow/Clock';
import Images from '@spectrum-icons/workflow/Images';
import DocumentOutline from '@spectrum-icons/workflow/DocumentOutline';
import { useTranslation } from 'react-i18next';
import path from 'path-browserify';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';

interface DashboardPanelProps {
    configData: React.MutableRefObject<ConfigData>;
    documentValue: CurrentDocumentValue;
    exportSettings: React.MutableRefObject<ExportSettings>;
    progress: ExportProgress;
    setProgress: React.Dispatch<React.SetStateAction<ExportProgress>>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
}

function DashboardPanel({
    configData,
    documentValue,
    exportSettings,
    progress,
    setProgress,
    onConfigChange,
    onExportSettingsChange,
}: DashboardPanelProps) {
    const { t } = useTranslation();

    const openExternalLink = (url: string) => {
        try {
            window.cep.util.openURLInDefaultBrowser(url);
        } catch (error) {
            //pass
        }
    };
    
    const formatTime = () => {
        const timeSpent = documentValue.timeSpent ?? 0;
        const hours = Math.floor(timeSpent / 3600);
        const minutes = Math.floor((timeSpent % 3600) / 60);
        const seconds = timeSpent % 60;
        if (hours > 0) {
            return `${hours}${t('h')} ${minutes}${t('m')}`;
        } else if (minutes > 0) {
            return `${minutes}${t('m')} ${seconds}${t('s')}`;
        } else {
            return `${seconds}${t('s')}`;
        }
    }

    return(
        <div className="fr-dashboard">
            <div className="fr-dashboard-toolbar">
                <button
                    type="button"
                    role="switch"
                    aria-checked={configData.current.isEnabled}
                    aria-label="Toggle Enabled"
                    className="fr-record-switch"
                    onClick={() => {
                        onConfigChange({
                            isEnabled: !configData.current.isEnabled
                        });
                    }}
                >
                    <span className="fr-record-switch-track" aria-hidden="true">
                        <span className="fr-record-switch-thumb" />
                    </span>
                    <span className="fr-record-switch-label">
                        {configData.current.isEnabled ? t('Enabled') : t('Disabled')}
                    </span>
                </button>
                <ExportReplayButton configData={configData} documentValue={documentValue} exportSettings={exportSettings} progress={progress} setProgress={setProgress} onExportSettingsChange={onExportSettingsChange}/>
            </div>
            <div className="fr-dashboard-section">
                <div className="fr-data-row">
                    <div className="fr-row-label">
                        <DocumentOutline size="S" />
                        <Text>{t('Document')}</Text>
                    </div>
                    <div className="fr-row-value fr-document-value">
                        <TextField
                            width="100%"
                            value={documentValue.id ? documentValue.name || "" : ""}
                            isReadOnly
                        />
                        {documentValue.id && (
                            <TooltipTrigger delay={0}>
                                <ActionButton
                                    aria-label="Open Current Document Process Image Folder"
                                    onPress={() => {
                                        try {
                                            openLocalPath(path.join(configData.current.processImageFolderPath, documentValue.createTime || ""));
                                        } catch (error) {
                                            alert(error);
                                        }
                                    }}
                                    isDisabled={!documentValue.count}
                                    UNSAFE_className="fr-document-folder-button"
                                    >
                                    <FolderOpen />
                                </ActionButton>
                                <Tooltip>{t('Open Process Image Folder')}</Tooltip>
                            </TooltipTrigger>
                        )}
                    </div>
                </div>
                <div className="fr-data-row">
                    <div className="fr-row-label">
                        <Images size="S" />
                        <Text>{t('Image Count')}</Text>
                    </div>
                    <div className="fr-row-value">
                        <TextField
                            width="100%"
                            value={documentValue.id ? String(documentValue.count ?? "") : ""}
                            isReadOnly
                        />
                    </div>
                </div>
                <div className="fr-data-row">
                    <div className="fr-row-label">
                        <Clock size="S" />
                        <Text>{t('Time Spent')}</Text>
                    </div>
                    <div className="fr-row-value">
                        <TextField
                            width="100%"
                            value={documentValue.id ? formatTime() : ""}
                            isReadOnly
                        />
                    </div>
                </div>
            </div>
            <div className="fr-community-links">
                <Link 
                    onPress={() => {
                        openExternalLink("https://github.com/BaguetteShimada/F_Record");
                    }}>
                        GitHub
                </Link>
            </div>
        </div>
    );
}

export default DashboardPanel;
