import * as React from 'react';
import { Button, DialogTrigger, Text, ToastQueue } from '@adobe/react-spectrum';
import Replay from '@spectrum-icons/workflow/Replay';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import { createDefaultExportProgress } from './models';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { getReplayDurationOptions } from './exportDurationOptions';
import { createFinishExportSettingsChange } from './exportSettingsActions';
import ExportProgressBar from './ExportProgressBar';
import ExportReplayDialog from './ExportReplayDialog';
import { openExportedVideo } from './exportVideoActions';
import { showExportFailureToast, showExportStartedToast, showExportSuccessToast } from './exportNotifications';
import { runExportReplayFlow } from './exportReplayFlow';
import { createExportReplayStart } from './exportStartActions';

interface ExportReplayButtonProps {
    configData: React.MutableRefObject<ConfigData>;
    documentValue: CurrentDocumentValue;
    exportSettings: React.MutableRefObject<ExportSettings>;
    progress: ExportProgress;
    setProgress: React.Dispatch<React.SetStateAction<ExportProgress>>;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
    onError: (error: unknown) => void;
}

function ExportReplayButton({
    configData,
    documentValue,
    exportSettings,
    progress,
    setProgress,
    onExportSettingsChange,
    onError,
}: ExportReplayButtonProps) {
    const { t } = useTranslation();

    const durationOptions = getReplayDurationOptions(documentValue.count, FPS);

    const clickConfirm = async (close: () => void) => {
        const exportStart = createExportReplayStart(exportSettings.current, documentValue.name, t);
        if (exportStart !== null) {
            onExportSettingsChange(exportStart.settingsChange);
            close();
            
            setProgress(createDefaultExportProgress());
            showExportStartedToast(t, ToastQueue);
            

            try {
                await runExportReplayFlow(configData.current, documentValue, exportStart.nextExportSettings, (nowProgress) => {
                    setProgress(nowProgress);
                });
                showExportSuccessToast(t, ToastQueue, () => openExportedVideo(exportStart.savePath, onError));
            } catch (error) {
                showExportFailureToast(error, t, ToastQueue, () => showError(error));
            } finally {
                onExportSettingsChange(createFinishExportSettingsChange());
            }
        }
    };

    return (
        <>
            {!exportSettings.current.isExporting ? (
                <DialogTrigger isDismissable>
                    <Button 
                        variant="accent" 
                        isDisabled={!documentValue.id || !documentValue.count}
                        UNSAFE_className="fr-export-button"
                    >
                        <Replay size="S" />
                        <Text>{t('Export')}</Text>
                    </Button>
                    {(close) => (
                        <ExportReplayDialog
                            exportSettings={exportSettings.current}
                            durationOptions={durationOptions}
                            onExportSettingsChange={onExportSettingsChange}
                            onConfirm={() => {
                                clickConfirm(close);
                            }}
                        />
                    )}
                </DialogTrigger>
            ) : (
                <ExportProgressBar progress={progress} label={t(progress.status)} />
            )}
        </>
    );
};

export default ExportReplayButton;
