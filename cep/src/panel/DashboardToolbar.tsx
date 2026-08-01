import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ExportReplayButton from "./ExportReplayButton";
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import RecordToggleButton from './RecordToggleButton';

interface DashboardToolbarProps {
    configData: React.MutableRefObject<ConfigData>;
    documentValue: CurrentDocumentValue;
    exportSettings: React.MutableRefObject<ExportSettings>;
    progress: ExportProgress;
    setProgress: React.Dispatch<React.SetStateAction<ExportProgress>>;
    onConfigChange: (configChange: Partial<ConfigData>) => void;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
    onError: (error: unknown) => void;
}

function DashboardToolbar({
    configData,
    documentValue,
    exportSettings,
    progress,
    setProgress,
    onConfigChange,
    onExportSettingsChange,
    onError,
}: DashboardToolbarProps) {
    const { t } = useTranslation();

    return (
        <div className="fr-panel-section fr-dashboard-toolbar">
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
            <ExportReplayButton
                configData={configData}
                documentValue={documentValue}
                exportSettings={exportSettings}
                progress={progress}
                setProgress={setProgress}
                onExportSettingsChange={onExportSettingsChange}
                onError={onError}
            />
        </div>
    );
}

export default DashboardToolbar;
