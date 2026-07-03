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
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { GITHUB_REPOSITORY_URL, openExternalUrl } from './externalLinks';
import {
    getDocumentNameDisplayValue,
    getImageCountDisplayValue,
    getTimeSpentDisplayValue,
} from './dashboardValues';
import RecordToggleButton from './RecordToggleButton';
import GitHubIcon from './GitHubIcon';
import { openCurrentDocumentProcessImageFolder } from './documentFolderActions';
import DashboardTextRow from './DashboardTextRow';

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

    return(
        <div className="fr-dashboard">
            <div className="fr-dashboard-toolbar">
                <RecordToggleButton
                    isEnabled={configData.current.isEnabled}
                    enabledLabel={t('Enabled')}
                    disabledLabel={t('Disabled')}
                    onToggle={() => {
                        onConfigChange({
                            isEnabled: !configData.current.isEnabled
                        });
                    }}
                />
                <ExportReplayButton configData={configData} documentValue={documentValue} exportSettings={exportSettings} progress={progress} setProgress={setProgress} onExportSettingsChange={onExportSettingsChange} onError={onError}/>
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
                            value={getDocumentNameDisplayValue(documentValue)}
                            isReadOnly
                        />
                        {documentValue.id && (
                            <TooltipTrigger delay={0}>
                                <ActionButton
                                    aria-label="Open Current Document Process Image Folder"
                                    onPress={() => {
                                        openCurrentDocumentProcessImageFolder(configData.current, documentValue, onError);
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
                <DashboardTextRow
                    icon={<Images size="S" />}
                    label={t('Image Count')}
                    value={getImageCountDisplayValue(documentValue)}
                />
                <DashboardTextRow
                    icon={<Clock size="S" />}
                    label={t('Time Spent')}
                    value={getTimeSpentDisplayValue(documentValue, {
                        hours: t('h'),
                        minutes: t('m'),
                        seconds: t('s'),
                    })}
                />
            </div>
            <div className="fr-community-links">
                <TooltipTrigger delay={0}>
                    <ActionButton
                        aria-label="GitHub"
                        onPress={() => {
                            openExternalUrl(GITHUB_REPOSITORY_URL, onError);
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
