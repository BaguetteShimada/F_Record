import * as React from 'react';
import { ActionButton, Text, TextField, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import FolderOpen from '@spectrum-icons/workflow/FolderOpen';

interface SettingsFolderSectionProps {
    label: string;
    value: string;
    buttonLabel: string;
    tooltipLabel: string;
    onSelectFolder: () => void;
}

function SettingsFolderSection({
    label,
    value,
    buttonLabel,
    tooltipLabel,
    onSelectFolder,
}: SettingsFolderSectionProps) {
    return (
        <div className="fr-panel-section fr-settings-section fr-settings-folder-section">
            <div className="fr-field-row fr-settings-row">
                <div className="fr-field-label fr-settings-label">
                    <Text>{label}</Text>
                </div>
                <div className="fr-field-control fr-control-group fr-settings-folder-row">
                <TextField
                    aria-label="Process Image Folder"
                    value={value}
                    isReadOnly
                    width="100%"
                    UNSAFE_className="fr-control-field fr-settings-folder-field"
                />
                <TooltipTrigger delay={0}>
                    <ActionButton
                        aria-label={buttonLabel}
                        onPress={onSelectFolder}
                        UNSAFE_className="fr-icon-button fr-settings-folder-button"
                    >
                        <FolderOpen />
                    </ActionButton>
                    <Tooltip>{tooltipLabel}</Tooltip>
                </TooltipTrigger>
                </div>
            </div>
        </div>
    );
}

export default SettingsFolderSection;
