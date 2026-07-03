import * as React from 'react';
import { Button, Content, Dialog, DialogTrigger, Flex, Item, Picker, ProgressBar, Text, ToastQueue } from '@adobe/react-spectrum';
import Replay from '@spectrum-icons/workflow/Replay';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { estimateReplayDurationSeconds, getReplayDurationPresetSeconds } from './exportDurationOptions';
import { prepareExportReplayParams, runPreparedExportReplay } from './exportReplayService';
import { getExportFailureMessageDescriptor } from './exportErrors';
import { selectExportSavePath } from './exportSaveDialog';
import {
    createFinishExportSettingsChange,
    createStartedExportSettings,
    createStartExportSettingsChange,
} from './exportSettingsActions';
import { ASPECT_RATIO_OPTIONS } from './exportDialogOptions';

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

    const estimatedDuration = estimateReplayDurationSeconds(documentValue.count, FPS);
    const durationPresets = getReplayDurationPresetSeconds(documentValue.count, FPS);
    const hasDurationPreset = (duration: number) => durationPresets.indexOf(duration) >= 0;

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
            
            setProgress({
                status: "",
                percent: 0
            });
            ToastQueue.info(t('Start to export'), {timeout: 5000});
            

            try {
                const exportParams = await prepareExportReplayParams(configData.current, documentValue, nextExportSettings);
                await runPreparedExportReplay(exportParams, (nowProgress) => {
                    setProgress(nowProgress);
                });
                ToastQueue.positive(t('Export success'), {
                    actionLabel: t('Open'),
                    onAction: () => {
                        try {
                            openLocalPath(savePath);
                        } catch (error) {
                            onError(error);
                        }
                    }
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
                        <Dialog>
                            <Content>
                                <Flex direction="column">
                                    <Flex direction="row" justifyContent="space-between" marginBottom="size-100">
                                        <Text>{t('Aspect Ratio')}</Text>
                                        <Picker aria-label="Replay Aspect Ratio"
                                            selectedKey={exportSettings.current.aspectRatio}
                                            onSelectionChange={(key) => {
                                                onExportSettingsChange({
                                                    aspectRatio: String(key)
                                                });
                                            }}
                                            width="size-1600">
                                            {ASPECT_RATIO_OPTIONS.map((option) => (
                                                <Item key={option.key}>
                                                    {'labelKey' in option ? t(option.labelKey) : option.label}
                                                </Item>
                                            ))}
                                        </Picker>
                                    </Flex>
                                    <Flex direction="row" justifyContent="space-between" marginBottom="size-300">
                                        <Text>{t('Duration')}</Text>
                                        <Picker aria-label="Replay Duration"
                                            selectedKey={exportSettings.current.duration}
                                            onSelectionChange={(key) => {
                                                onExportSettingsChange({
                                                    duration: String(key)
                                                });
                                            }}
                                            width="size-1600">
                                            {hasDurationPreset(15) && <Item key="15">{15 + t('s')}</Item>}
                                            {hasDurationPreset(30) && <Item key="30">{30 + t('s')}</Item>}
                                            {hasDurationPreset(60) && <Item key="60">{60 + t('s')}</Item>}
                                            {hasDurationPreset(180) && <Item key="180">{180 + t('s')}</Item>}
                                            <Item key="0">{estimatedDuration + t('s') + ' ' + t('(original)')}</Item>
                                        </Picker>
                                    </Flex>
                                    <Flex justifyContent="center">
                                        <Button
                                            variant="accent"
                                            onPress={() => {
                                                clickConfirm(close);
                                            }}
                                            width="size-1200"
                                        >
                                            {t('Confirm')}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Content>
                        </Dialog>
                    )}
                </DialogTrigger>
            ) : (
                <ProgressBar
                    value={progress.percent}
                    label={t(progress.status)}
                    width="100%"
                    UNSAFE_className="fr-export-progress"
                />
            )}
        </>
    );
};

export default ExportReplayButton;
