import * as React from 'react';
import Clock from '@spectrum-icons/workflow/Clock';
import Images from '@spectrum-icons/workflow/Images';
import { useTranslation } from 'react-i18next';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import {
    getDocumentNameDisplayValue,
    getImageCountDisplayValue,
    getTimeSpentDisplayValue,
} from './dashboardValues';
import { openCurrentDocumentProcessImageFolder } from './documentFolderActions';
import DashboardTextRow from './DashboardTextRow';
import DashboardDocumentRow from './DashboardDocumentRow';
import GitHubLinkButton from './GitHubLinkButton';
import DashboardToolbar from './DashboardToolbar';

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
            <DashboardToolbar
                configData={configData}
                documentValue={documentValue}
                exportSettings={exportSettings}
                progress={progress}
                setProgress={setProgress}
                onConfigChange={onConfigChange}
                onExportSettingsChange={onExportSettingsChange}
                onError={onError}
            />
            <div className="fr-dashboard-section">
                <DashboardDocumentRow
                    label={t('Document')}
                    value={getDocumentNameDisplayValue(documentValue)}
                    showOpenButton={Boolean(documentValue.id)}
                    isOpenButtonDisabled={!documentValue.count}
                    openButtonLabel={t('Open Process Image Folder')}
                    onOpenFolder={() => {
                        openCurrentDocumentProcessImageFolder(configData.current, documentValue, onError);
                    }}
                />
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
                <GitHubLinkButton onError={onError} />
            </div>
        </div>
    );
}

export default DashboardPanel;
