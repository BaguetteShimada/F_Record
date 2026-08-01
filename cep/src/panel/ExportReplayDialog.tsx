import * as React from 'react';
import { Button, Content, Dialog, Item, Picker, Text } from '@adobe/react-spectrum';
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
                <div className="fr-export-dialog-content">
                    <div className="fr-field-row fr-dialog-row">
                        <div className="fr-field-label">
                            <Text>{t('Aspect Ratio')}</Text>
                        </div>
                        <Picker
                            aria-label="Replay Aspect Ratio"
                            selectedKey={exportSettings.aspectRatio}
                            onSelectionChange={(key) => {
                                applyExportStringOptionChange('aspectRatio', key, onExportSettingsChange);
                            }}
                            width="size-1600"
                            UNSAFE_className="fr-control-picker fr-export-picker"
                        >
                            {ASPECT_RATIO_OPTIONS.map((option) => (
                                <Item key={option.key}>
                                    {'labelKey' in option ? t(option.labelKey) : option.label}
                                </Item>
                            ))}
                        </Picker>
                    </div>
                    <div className="fr-field-row fr-dialog-row">
                        <div className="fr-field-label">
                            <Text>{t('Duration')}</Text>
                        </div>
                        <Picker
                            aria-label="Replay Duration"
                            selectedKey={exportSettings.duration}
                            onSelectionChange={(key) => {
                                applyExportStringOptionChange('duration', key, onExportSettingsChange);
                            }}
                            width="size-1600"
                            UNSAFE_className="fr-control-picker fr-export-picker"
                        >
                            {durationOptions.map((option) => (
                                <Item key={option.key}>
                                    {option.durationSeconds + t('s') + (option.isOriginal ? ' ' + t('(original)') : '')}
                                </Item>
                            ))}
                        </Picker>
                    </div>
                    <div className="fr-dialog-actions">
                        <Button
                            variant="accent"
                            onPress={onConfirm}
                            width="size-1200"
                            UNSAFE_className="fr-primary-action fr-dialog-confirm-button"
                        >
                            {t('Confirm')}
                        </Button>
                    </div>
                </div>
            </Content>
        </Dialog>
    );
}

export default ExportReplayDialog;
