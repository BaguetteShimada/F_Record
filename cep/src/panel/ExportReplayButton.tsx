import * as React from 'react';
import { Button, DialogTrigger, Text, ToastQueue } from '@adobe/react-spectrum';
import Replay from '@spectrum-icons/workflow/Replay';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import { createDefaultExportProgress } from './models';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { getReplayDurationOptions } from './exportDurationOptions';
import { selectExportSavePath } from './exportSaveDialog';
import {
    createFinishExportSettingsChange,
    createStartedExportSettings,
    createStartExportSettingsChange,
} from './exportSettingsActions';
import ExportProgressBar from './ExportProgressBar';
import ExportReplayDialog from './ExportReplayDialog';
import { openExportedVideo } from './exportVideoActions';
import { showExportFailureToast, showExportStartedToast, showExportSuccessToast } from './exportNotifications';
import { runExportReplayFlow } from './exportReplayFlow';

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
        const savePath = selectExportSavePath(documentValue.name, t("Select Export Path"));
        if (savePath !== null) {
            const nextExportSettings = createStartedExportSettings(exportSettings.current, savePath);
            onExportSettingsChange(createStartExportSettingsChange(savePath));
            close();
            
            setProgress(createDefaultExportProgress());
            showExportStartedToast(t, ToastQueue);
            

            try {
                await runExportReplayFlow(configData.current, documentValue, nextExportSettings, (nowProgress) => {
                    setProgress(nowProgress);
                });
                showExportSuccessToast(t, ToastQueue, () => openExportedVideo(savePath, onError));
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
