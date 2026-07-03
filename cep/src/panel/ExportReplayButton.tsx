import * as React from 'react';
import { Button, DialogTrigger, Text, ToastQueue } from '@adobe/react-spectrum';
import Replay from '@spectrum-icons/workflow/Replay';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import { createDefaultExportProgress } from './models';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { getReplayDurationOptions } from './exportDurationOptions';
import { prepareExportReplayParams, runPreparedExportReplay } from './exportReplayService';
import { getExportFailureMessageDescriptor } from './exportErrors';
import { selectExportSavePath } from './exportSaveDialog';
import {
    createFinishExportSettingsChange,
    createStartedExportSettings,
    createStartExportSettingsChange,
} from './exportSettingsActions';
import ExportProgressBar from './ExportProgressBar';
import ExportReplayDialog from './ExportReplayDialog';
import { openExportedVideo } from './exportVideoActions';

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

    const getExportFailureMessage = (error: unknown): string => {
        const message = getExportFailureMessageDescriptor(error);
        return t(message.key, message.values);
    };

    const clickConfirm = async (close: () => void) => {
        const savePath = selectExportSavePath(documentValue.name, t("Select Export Path"));
        if (savePath !== null) {
            const nextExportSettings = createStartedExportSettings(exportSettings.current, savePath);
            onExportSettingsChange(createStartExportSettingsChange(savePath));
            close();
            
            setProgress(createDefaultExportProgress());
            ToastQueue.info(t('Start to export'), {timeout: 5000});
            

            try {
                const exportParams = await prepareExportReplayParams(configData.current, documentValue, nextExportSettings);
                await runPreparedExportReplay(exportParams, (nowProgress) => {
                    setProgress(nowProgress);
                });
                ToastQueue.positive(t('Export success'), {
                    actionLabel: t('Open'),
                    onAction: () => openExportedVideo(savePath, onError)
                });
            } catch (error) {
                ToastQueue.negative(getExportFailureMessage(error), {
                    actionLabel: t('Details'),
                    onAction: () => showError(error)
                });
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
