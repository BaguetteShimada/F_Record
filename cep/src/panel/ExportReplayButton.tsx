import { Item, Picker, ProgressBar } from '@adobe/react-spectrum';
import { Flex } from '@adobe/react-spectrum';
import { Content } from '@adobe/react-spectrum';
import { Dialog } from '@adobe/react-spectrum';
import { Button } from '@adobe/react-spectrum';
import { DialogTrigger } from '@adobe/react-spectrum';
import {ToastQueue} from '@adobe/react-spectrum'
import * as React from 'react';
import Replay from '@spectrum-icons/workflow/Replay';
import { Text } from '@adobe/react-spectrum';
import { useTranslation } from 'react-i18next';
import { FPS } from './constants';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { estimateReplayDurationSeconds, getReplayDurationPresetSeconds } from './exportDurationOptions';
import { prepareExportReplayParams, runPreparedExportReplay } from './exportReplayService';
import { getExportFailureMessageDescriptor } from './exportErrors';

interface ExportReplayButtonProps {
    configData: React.MutableRefObject<ConfigData>;
    documentValue: CurrentDocumentValue;
    exportSettings: React.MutableRefObject<ExportSettings>;
    progress: ExportProgress;
    setProgress: React.Dispatch<React.SetStateAction<ExportProgress>>;
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
}

function ExportReplayButton({
    configData,
    documentValue,
    exportSettings,
    progress,
    setProgress,
    onExportSettingsChange,
}: ExportReplayButtonProps) {
    const { t } = useTranslation();

    const estimatedDuration = estimateReplayDurationSeconds(documentValue.count, FPS);
    const durationPresets = getReplayDurationPresetSeconds(documentValue.count, FPS);
    const hasDurationPreset = (duration: number) => durationPresets.indexOf(duration) >= 0;

    const getExportFailureMessage = (error: unknown): string => {
        const message = getExportFailureMessageDescriptor(error);
        return t(message.key, message.values);
    }

    const clickConfirm = async (close: () => void) => {
        const result = window.cep.fs.showSaveDialogEx(t("Select Export Path"), "", ["mp4"], `${documentValue.name || ""}.mp4`, "MP4 (*.mp4)");
        if (result.err === 0 && result.data !== "") {
            const nextExportSettings = {
                ...exportSettings.current,
                savePath: result.data,
                isExporting: true,
            };
            onExportSettingsChange({
                savePath: result.data,
                isExporting: true,
            });
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
                            openLocalPath(result.data);
                        } catch (error) {
                            ToastQueue.negative(t('Error'), {
                                actionLabel: t('Details'),
                                onAction: () => showError(error)
                            });
                        }
                    }
                });
            } catch (error) {
                ToastQueue.negative(getExportFailureMessage(error), {
                    actionLabel: t('Details'),
                    onAction: () => showError(error)
                });
            } finally {
                onExportSettingsChange({
                    isExporting: false
                });
            }
        }
    }

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
                                            <Item key="1.7778">16:9</Item>
                                            <Item key="1.3333">4:3</Item>
                                            <Item key="1">1:1</Item>
                                            <Item key="0.75">3:4</Item>
                                            <Item key="0.5625">9:16</Item>
                                            <Item key="0">{t('match canvas')}</Item>
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
