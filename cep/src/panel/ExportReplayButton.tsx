import * as React from 'react';
import { Button, DialogTrigger, Text, ToastQueue } from '@adobe/react-spectrum';
import Replay from '@spectrum-icons/workflow/Replay';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { getReplayDurationOptions } from './exportDurationOptions';
import ExportProgressBar from './ExportProgressBar';
import ExportReplayDialog from './ExportReplayDialog';
import { isExportReplayDisabled } from './exportAvailability';
import { confirmExportReplay } from './exportReplayConfirmAction';

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
        await confirmExportReplay({
            configData: configData.current,
            documentValue,
            exportSettings: exportSettings.current,
            t,
            close,
            setProgress,
            onExportSettingsChange,
            onError,
            toastQueue: ToastQueue,
        });
    };

    return (
        <>
            {!exportSettings.current.isExporting ? (
                <DialogTrigger isDismissable>
                    <Button 
                        variant="accent" 
                        isDisabled={isExportReplayDisabled(documentValue)}
                        UNSAFE_className="fr-primary-action fr-export-button"
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
