import * as React from 'react';
import { Button, Content, Dialog, Flex, Item, Picker, Text } from '@adobe/react-spectrum';
import { useTranslation } from 'react-i18next';
import type { ExportSettings } from './models';
import type { ReplayDurationOption } from './exportDurationOptions';
import { ASPECT_RATIO_OPTIONS } from './exportDialogOptions';
import { applyExportStringOptionChange } from './exportOptionActions';

interface ExportReplayDialogProps {
    exportSettings: ExportSettings;
    durationOptions: ReplayDurationOption[];
    onExportSettingsChange: (exportSettingsChange: Partial<ExportSettings>) => void;
    onConfirm: () => void;
}

function ExportReplayDialog({
    exportSettings,
    durationOptions,
    onExportSettingsChange,
    onConfirm,
}: ExportReplayDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <Content>
                <Flex direction="column">
                    <Flex direction="row" justifyContent="space-between" marginBottom="size-100">
                        <Text>{t('Aspect Ratio')}</Text>
                        <Picker
                            aria-label="Replay Aspect Ratio"
                            selectedKey={exportSettings.aspectRatio}
                            onSelectionChange={(key) => {
                                applyExportStringOptionChange('aspectRatio', key, onExportSettingsChange);
                            }}
                            width="size-1600"
                        >
                            {ASPECT_RATIO_OPTIONS.map((option) => (
                                <Item key={option.key}>
                                    {'labelKey' in option ? t(option.labelKey) : option.label}
                                </Item>
                            ))}
                        </Picker>
                    </Flex>
                    <Flex direction="row" justifyContent="space-between" marginBottom="size-300">
                        <Text>{t('Duration')}</Text>
                        <Picker
                            aria-label="Replay Duration"
                            selectedKey={exportSettings.duration}
                            onSelectionChange={(key) => {
                                applyExportStringOptionChange('duration', key, onExportSettingsChange);
                            }}
                            width="size-1600"
                        >
                            {durationOptions.map((option) => (
                                <Item key={option.key}>
                                    {option.durationSeconds + t('s') + (option.isOriginal ? ' ' + t('(original)') : '')}
                                </Item>
                            ))}
                        </Picker>
                    </Flex>
                    <Flex justifyContent="center">
                        <Button
                            variant="accent"
                            onPress={onConfirm}
                            width="size-1200"
                        >
                            {t('Confirm')}
                        </Button>
                    </Flex>
                </Flex>
            </Content>
        </Dialog>
    );
}

export default ExportReplayDialog;
