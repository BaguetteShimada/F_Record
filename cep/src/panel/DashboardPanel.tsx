import * as React from 'react';
import { ActionButton, TooltipTrigger, Tooltip } from "@adobe/react-spectrum";
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
import { formatElapsedTime } from './timeFormatting';

function GitHubIcon() {
    return (
        <svg
            aria-hidden="true"
            className="fr-github-icon"
            focusable="false"
            viewBox="0 0 16 16"
        >
            <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
        </svg>
    );
}

interface DashboardPanelProps {
    configData: React.MutableRefObject<ConfigData>;
    documentValue: CurrentDocumentValue;
    exportSettings: React.MutableRefObject<ExportSettings>;
    progress: ExportProgress;
    setProgress: React.Dispatch<React.SetStateAction<ExportProgress>>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
    onError: (error: unknown) => void;
}

function DashboardPanel({
    configData,
    documentValue,
    exportSettings,
    progress,
    setProgress,
    onConfigChange,
    onExportSettingsChange,
    onError,
}: DashboardPanelProps) {
    const { t } = useTranslation();

    const openExternalLink = (url: string) => {
        try {
            window.cep.util.openURLInDefaultBrowser(url);
        } catch (error) {
            onError(error);
        }
    };
    
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
                    <div className="fr-document-value">
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
                                            onError(error);
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
                            value={documentValue.id ? formatElapsedTime(documentValue.timeSpent, {
                                hours: t('h'),
                                minutes: t('m'),
                                seconds: t('s'),
                            }) : ""}
                            isReadOnly
                        />
                    </div>
                </div>
            </div>
            <div className="fr-community-links">
                <TooltipTrigger delay={0}>
                    <ActionButton
                        aria-label="GitHub"
                        onPress={() => {
                            openExternalLink("https://github.com/BaguetteShimada/F_Record");
                        }}
                        UNSAFE_className="fr-github-button"
                    >
                        <GitHubIcon />
                    </ActionButton>
                    <Tooltip>GitHub</Tooltip>
                </TooltipTrigger>
            </div>
        </div>
    );
}

export default DashboardPanel;
